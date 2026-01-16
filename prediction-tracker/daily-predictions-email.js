/**
 * DAILY PREDICTION EMAIL GENERATOR (AI-POWERED)
 *
 * This Google Apps Script fetches news headlines and uses Google Gemini AI
 * to generate high-quality forecasting questions in Good Judgment Project style.
 *
 * To install:
 * 1. Go to https://aistudio.google.com/app/apikey
 * 2. Click "Create API key" and copy it
 * 3. Go to script.google.com
 * 4. Create new project
 * 5. Paste this entire code
 * 6. Replace 'YOUR_GEMINI_API_KEY_HERE' with your API key
 * 7. Run setup() once to test
 * 8. Set up daily trigger for sendDailyPredictions()
 */

// ============================================
// CONFIGURATION - Edit these as needed
// ============================================
const CONFIG = {
  email: 'duncan.heidkamp@gmail.com',
  predictionsPerEmail: 5,

  // Google Gemini API Key - Get yours at: https://aistudio.google.com/app/apikey
  geminiApiKey: 'AIzaSyC9DTXodVMCZCyVv66_wOCIH_nLY-adAxU',

  // Category weights (higher = more likely to be included)
  categoryWeights: {
    'U.S. Politics': 3,
    'Business/Finance': 3,
    'World Events': 1,
    'Sports': 1
  },

  // RSS feeds for each category
  feeds: {
    'World Events': [
      'https://feeds.apnews.com/rss/topnews',
      'https://feeds.reuters.com/reuters/worldNews'
    ],
    'U.S. Politics': [
      'https://feeds.npr.org/1001/rss.xml',
      'https://feeds.apnews.com/rss/politics'
    ],
    'Business/Finance': [
      'https://feeds.bloomberg.com/markets/news.rss',
      'https://finance.yahoo.com/news/rssindex'
    ],
    'Sports': [
      'https://www.espn.com/espn/rss/news',
      'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml'
    ]
  }
};

// ============================================
// MAIN FUNCTION - This runs daily
// ============================================
function sendDailyPredictions() {
  try {
    // Fetch headlines from all feeds
    const headlines = fetchAllHeadlines();

    if (headlines.length === 0) {
      Logger.log('No headlines fetched');
      return;
    }

    // Generate prediction suggestions
    const predictions = generatePredictions(headlines);

    // Format and send email
    const emailBody = formatEmail(predictions);

    GmailApp.sendEmail(
      CONFIG.email,
      '📊 Your Daily Prediction Ideas - ' + formatDate(new Date()),
      '', // plain text (empty, we use HTML)
      {
        htmlBody: emailBody,
        name: 'Prediction Tracker'
      }
    );

    Logger.log('Email sent successfully with ' + predictions.length + ' predictions');

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    // Send error notification
    GmailApp.sendEmail(
      CONFIG.email,
      '⚠️ Prediction Email Error',
      'The daily prediction email failed: ' + error.toString()
    );
  }
}

// ============================================
// FETCH HEADLINES FROM RSS FEEDS
// ============================================
function fetchAllHeadlines() {
  const allHeadlines = [];

  for (const [category, feeds] of Object.entries(CONFIG.feeds)) {
    for (const feedUrl of feeds) {
      try {
        const headlines = fetchRssFeed(feedUrl, category);
        allHeadlines.push(...headlines);
      } catch (e) {
        Logger.log('Failed to fetch ' + feedUrl + ': ' + e.toString());
      }
    }
  }

  // Shuffle to get variety
  return shuffleArray(allHeadlines);
}

function fetchRssFeed(url, category) {
  const headlines = [];

  try {
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true
    });

    const xml = response.getContentText();
    const document = XmlService.parse(xml);
    const root = document.getRootElement();

    // Handle both RSS and Atom feeds
    const items = findItems(root);

    for (let i = 0; i < Math.min(items.length, 10); i++) {
      const item = items[i];
      const title = getItemTitle(item);
      const link = getItemLink(item);
      const pubDate = getItemDate(item);

      if (title && title.length > 20) {
        headlines.push({
          title: title,
          link: link,
          category: category,
          date: pubDate,
          source: extractDomain(url)
        });
      }
    }
  } catch (e) {
    Logger.log('RSS parse error for ' + url + ': ' + e.toString());
  }

  return headlines;
}

function findItems(root) {
  const namespace = root.getNamespace();

  // Try RSS format
  let channel = root.getChild('channel');
  if (channel) {
    return channel.getChildren('item');
  }

  // Try Atom format
  const atomNs = XmlService.getNamespace('http://www.w3.org/2005/Atom');
  let entries = root.getChildren('entry', atomNs);
  if (entries.length > 0) return entries;

  entries = root.getChildren('entry');
  if (entries.length > 0) return entries;

  // Try direct items
  return root.getChildren('item');
}

function getItemTitle(item) {
  // Try common title locations
  const titleEl = item.getChild('title');
  if (titleEl) return titleEl.getText().trim();

  const atomNs = XmlService.getNamespace('http://www.w3.org/2005/Atom');
  const atomTitle = item.getChild('title', atomNs);
  if (atomTitle) return atomTitle.getText().trim();

  return null;
}

function getItemLink(item) {
  const linkEl = item.getChild('link');
  if (linkEl) {
    const href = linkEl.getAttribute('href');
    if (href) return href.getValue();
    return linkEl.getText().trim();
  }
  return '';
}

function getItemDate(item) {
  const pubDate = item.getChild('pubDate');
  if (pubDate) return pubDate.getText();

  const published = item.getChild('published');
  if (published) return published.getText();

  const updated = item.getChild('updated');
  if (updated) return updated.getText();

  return new Date().toISOString();
}

// ============================================
// GEMINI AI INTEGRATION
// ============================================
function generateWithGemini(headlines) {
  // Check if API key is configured
  if (!CONFIG.geminiApiKey || CONFIG.geminiApiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    Logger.log('Gemini API key not configured, using fallback');
    return null;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Build the prompt with all headlines
  const headlineList = headlines.map((h, i) =>
    `${i + 1}. [${h.category}] "${h.title}"`
  ).join('\n');

  const prompt = `You are an expert forecaster trained in the style of the Good Judgment Project. Your task is to convert news headlines into well-formed prediction questions.

Today's date: ${dateStr}

For each headline below, create a forecasting question that follows these rules:
1. BINARY: Question must be answerable with Yes or No
2. SPECIFIC: Include a specific deadline date (choose an appropriate timeframe: 2 weeks to 6 months)
3. MEASURABLE: Include clear resolution criteria (what source will confirm the outcome)
4. ACTIONABLE: Focus on concrete events, not vague trends

Format each response EXACTLY like this (one per headline):
HEADLINE: [original headline]
QUESTION: Will [specific event] happen before [date]?
RESOLUTION: [specific source or method to verify outcome]

Headlines to convert:
${headlineList}

Generate ${headlines.length} prediction questions, one for each headline. Be creative and think about what interesting follow-on events could stem from each story.`;

  try {
    const response = UrlFetchApp.fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.geminiApiKey}`,
      {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        }),
        muteHttpExceptions: true
      }
    );

    const responseCode = response.getResponseCode();
    if (responseCode !== 200) {
      Logger.log('Gemini API error: ' + responseCode + ' - ' + response.getContentText());
      return null;
    }

    const result = JSON.parse(response.getContentText());
    const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      Logger.log('No text in Gemini response');
      return null;
    }

    Logger.log('Gemini response received, parsing...');

    // Parse the AI response into predictions
    return parseGeminiResponse(aiText, headlines);

  } catch (error) {
    Logger.log('Gemini API error: ' + error.toString());
    return null;
  }
}

function parseGeminiResponse(aiText, headlines) {
  const predictions = [];

  // Split by "HEADLINE:" to get each prediction block
  const blocks = aiText.split(/HEADLINE:/i).filter(b => b.trim());

  for (let i = 0; i < blocks.length && i < headlines.length; i++) {
    const block = blocks[i];
    const headline = headlines[i];

    // Extract question and resolution
    const questionMatch = block.match(/QUESTION:\s*(.+?)(?=RESOLUTION:|$)/is);
    const resolutionMatch = block.match(/RESOLUTION:\s*(.+?)(?=HEADLINE:|$)/is);

    if (questionMatch) {
      let question = questionMatch[1].trim();
      let resolution = resolutionMatch ? resolutionMatch[1].trim() : '';

      // Clean up any extra newlines
      question = question.replace(/\n/g, ' ').trim();
      resolution = resolution.replace(/\n/g, ' ').trim();

      // Combine into suggestion
      let suggestion = question;
      if (resolution) {
        suggestion += ` Resolution: ${resolution}`;
      }

      predictions.push({
        headline: headline.title,
        category: headline.category,
        source: headline.source,
        link: headline.link,
        suggestion: suggestion,
        isNews: true
      });
    }
  }

  Logger.log(`Parsed ${predictions.length} predictions from Gemini`);
  return predictions;
}

// ============================================
// GENERATE PREDICTIONS FROM HEADLINES (AI-POWERED)
// ============================================
function generatePredictions(headlines) {
  // Weight headlines by category preference
  const weightedHeadlines = [];
  for (const headline of headlines) {
    const weight = CONFIG.categoryWeights[headline.category] || 1;
    for (let i = 0; i < weight; i++) {
      weightedHeadlines.push(headline);
    }
  }
  const shuffledHeadlines = shuffleArray(weightedHeadlines);

  // Select unique headlines for AI processing
  const selectedHeadlines = [];
  const usedTitles = new Set();

  for (const headline of shuffledHeadlines) {
    if (selectedHeadlines.length >= CONFIG.predictionsPerEmail) break;
    if (usedTitles.has(headline.title)) continue;
    if (headline.title.length < 30) continue;
    if (headline.title.includes('?')) continue;

    selectedHeadlines.push(headline);
    usedTitles.add(headline.title);
  }

  // Generate predictions using Gemini AI
  const aiPredictions = generateWithGemini(selectedHeadlines);

  // If AI fails, fall back to rule-based generation
  if (!aiPredictions || aiPredictions.length === 0) {
    Logger.log('AI generation failed, using fallback');
    return generatePredictionsFallback(selectedHeadlines);
  }

  return aiPredictions;
}

// Fallback if AI is unavailable
function generatePredictionsFallback(headlines) {
  const predictions = [];

  for (const headline of headlines) {
    const suggestion = generateSmartSuggestion(headline.title, headline.category);
    if (suggestion) {
      predictions.push({
        headline: headline.title,
        category: headline.category,
        source: headline.source,
        link: headline.link,
        suggestion: suggestion,
        isNews: true
      });
    }
  }

  return predictions;
}

// Rule-based fallback for when AI is unavailable
function generateSmartSuggestion(title, category) {
  const titleLower = title.toLowerCase();
  const tf = getTimeframes();

  // Extract entities from headline for more specific questions
  const entities = extractEntities(title);

  // U.S. Politics - Good Judgment style questions
  if (category === 'U.S. Politics') {
    if (titleLower.includes('bill') || titleLower.includes('legislation') || titleLower.includes('act')) {
      return `Will ${entities.subject || 'this legislation'} pass ${randomChoice(['the House', 'the Senate', 'both chambers of Congress'])} before ${tf.days90}? Resolution: Check congress.gov for recorded votes.`;
    }
    if (titleLower.includes('investigation') || titleLower.includes('probe') || titleLower.includes('inquiry') || titleLower.includes('charges')) {
      return `Will ${entities.subject || 'this investigation'} result in formal criminal charges being filed before ${tf.days90}? Resolution: DOJ press releases or court filings.`;
    }
    if (titleLower.includes('trump')) {
      return `Will Donald Trump ${randomChoice([
        `be formally sentenced in any criminal case before ${tf.days60}`,
        `announce a major policy initiative related to this before ${tf.days30}`,
        `face new formal legal action related to this before ${tf.days45}`
      ])}? Resolution: Court records or official announcements.`;
    }
    if (titleLower.includes('biden')) {
      return `Will President Biden ${randomChoice([
        `sign an executive order addressing this before ${tf.days30}`,
        `publicly address this in a formal speech before ${tf.days14}`,
        `announce new policy related to this before ${tf.days30}`
      ])}? Resolution: White House press releases.`;
    }
    if (titleLower.includes('supreme court') || titleLower.includes('scotus')) {
      return `Will the Supreme Court ${randomChoice(['grant certiorari on', 'issue a ruling on', 'hear oral arguments on'])} this matter before ${tf.endOfTerm}? Resolution: SCOTUSblog or official court calendar.`;
    }
    if (titleLower.includes('senate') || titleLower.includes('confirm')) {
      return `Will the Senate ${randomChoice(['confirm', 'hold a vote on', 'begin hearings for'])} ${entities.person || 'this nominee'} before ${tf.days60}? Resolution: Senate.gov records.`;
    }
    if (titleLower.includes('resign') || titleLower.includes('step down')) {
      return `Will ${entities.person || 'this official'} formally resign or announce resignation before ${tf.days30}? Resolution: Official statement or press release.`;
    }
    // Default politics
    return `Will ${randomChoice(['Congress', 'the White House', 'the DOJ'])} take formal action on this matter before ${tf.days45}? Resolution: Official government announcements.`;
  }

  // Business/Finance - Good Judgment style questions
  if (category === 'Business/Finance') {
    if (titleLower.includes('fed') || titleLower.includes('interest rate') || titleLower.includes('federal reserve')) {
      return `Will the Federal Reserve ${randomChoice(['raise', 'cut'])} the federal funds rate at its next FOMC meeting? Resolution: FOMC statement at federalreserve.gov.`;
    }
    if (titleLower.includes('layoff') || titleLower.includes('job cut') || titleLower.includes('workforce') || titleLower.includes('firing')) {
      return `Will ${entities.company || 'this company'} announce additional layoffs exceeding 1,000 employees before ${tf.days60}? Resolution: Company press releases or SEC filings.`;
    }
    if (titleLower.includes('merger') || titleLower.includes('acquisition') || titleLower.includes('acquire') || titleLower.includes('buy')) {
      return `Will ${entities.subject || 'this acquisition'} receive regulatory approval from the FTC or DOJ before ${tf.days90}? Resolution: FTC.gov or Justice.gov announcements.`;
    }
    if (titleLower.includes('ipo') || titleLower.includes('going public')) {
      return `Will ${entities.company || 'this company'} complete its IPO before ${tf.days90}? Resolution: SEC EDGAR filings and exchange listing.`;
    }
    if (titleLower.includes('bankruptcy') || titleLower.includes('chapter 11')) {
      return `Will ${entities.company || 'this company'} emerge from bankruptcy protection before ${tf.days90}? Resolution: Bankruptcy court filings.`;
    }
    if (titleLower.includes('sec') || titleLower.includes('securities')) {
      return `Will the SEC file formal enforcement action related to this before ${tf.days60}? Resolution: SEC.gov litigation releases.`;
    }
    if (titleLower.includes('ceo') || titleLower.includes('chief executive')) {
      return `Will ${entities.company || 'this company'} announce a CEO change before ${tf.days90}? Resolution: Company press release or SEC 8-K filing.`;
    }
    if (titleLower.includes('tariff') || titleLower.includes('trade war') || titleLower.includes('import')) {
      return `Will the U.S. announce new tariffs or trade restrictions related to this before ${tf.days45}? Resolution: USTR or Commerce Department announcements.`;
    }
    // Default finance
    return `Will ${entities.company || 'a major company involved'} announce a significant strategic change (M&A, restructuring, or executive change) related to this before ${tf.days60}? Resolution: Company press releases or SEC filings.`;
  }

  // World Events - Good Judgment style questions
  if (category === 'World Events') {
    if (titleLower.includes('war') || titleLower.includes('military') || titleLower.includes('troops') || titleLower.includes('invasion')) {
      return `Will ${entities.country || 'a major power'} ${randomChoice([
        `deploy additional military forces`,
        `announce a ceasefire or peace talks`,
        `face UN Security Council action`
      ])} related to this before ${tf.days30}? Resolution: Official government or UN announcements.`;
    }
    if (titleLower.includes('election')) {
      return `Will the ${randomChoice(['incumbent', 'opposition', 'ruling party'])} win ${entities.country ? entities.country + "'s" : 'this'} election? Resolution: Official election results from election authority.`;
    }
    if (titleLower.includes('sanction')) {
      return `Will the ${randomChoice(['U.S.', 'EU', 'UN'])} impose additional sanctions related to this before ${tf.days45}? Resolution: Treasury OFAC, EU Official Journal, or UN resolutions.`;
    }
    if (titleLower.includes('treaty') || titleLower.includes('agreement') || titleLower.includes('deal')) {
      return `Will this agreement be formally ratified by all parties before ${tf.days90}? Resolution: Official government ratification announcements.`;
    }
    // Default world
    return `Will the U.S. State Department issue a formal statement or policy change regarding this before ${tf.days30}? Resolution: state.gov press releases.`;
  }

  // Sports - Good Judgment style questions
  if (category === 'Sports') {
    if (titleLower.includes('trade') || titleLower.includes('traded')) {
      return `Will ${entities.person || 'this player'} be traded before the ${randomChoice(['trade deadline', 'end of the season'])}? Resolution: Official team announcement.`;
    }
    if (titleLower.includes('contract') || titleLower.includes('sign') || titleLower.includes('extension')) {
      return `Will ${entities.person || 'this player'} sign a contract extension before ${tf.days60}? Resolution: Official team announcement or league transaction report.`;
    }
    if (titleLower.includes('injury') || titleLower.includes('injured') || titleLower.includes('out')) {
      return `Will ${entities.person || 'this player'} return to play before ${tf.days30}? Resolution: Official team injury report.`;
    }
    if (titleLower.includes('coach') || titleLower.includes('fired') || titleLower.includes('hire')) {
      return `Will ${entities.team || 'this team'} make a coaching change before ${tf.days45}? Resolution: Official team announcement.`;
    }
    // Default sports
    return `Will ${entities.team || 'this team'} make the playoffs this season? Resolution: Official league standings at end of regular season.`;
  }

  // Fallback
  return `Will this development result in formal government or corporate action before ${tf.days45}? Resolution: Official announcements from relevant authorities.`;
}

// Extract named entities from headlines
function extractEntities(title) {
  const entities = {
    person: null,
    company: null,
    country: null,
    subject: null,
    team: null
  };

  // Common patterns for extracting entities
  // This is simplified - real NER would be more sophisticated

  // Look for company names (often followed by specific patterns)
  const companyPatterns = [
    /\b(Apple|Google|Microsoft|Amazon|Meta|Tesla|Netflix|Nvidia|OpenAI|Boeing|Ford|GM|JPMorgan|Goldman|Citi)\b/i,
    /\b([A-Z][a-z]+ (?:Inc|Corp|Co|LLC|Ltd)\.?)\b/,
    /\b([A-Z][a-z]+(?:soft|book|tube|ify|ly))\b/
  ];

  for (const pattern of companyPatterns) {
    const match = title.match(pattern);
    if (match) {
      entities.company = match[1];
      break;
    }
  }

  // Look for countries
  const countryPatterns = /\b(China|Russia|Ukraine|Israel|Iran|North Korea|Taiwan|Germany|France|UK|Britain|Japan|India|Brazil|Mexico|Canada)\b/i;
  const countryMatch = title.match(countryPatterns);
  if (countryMatch) {
    entities.country = countryMatch[1];
  }

  // Look for people (simplified - looks for two capitalized words together)
  const personPatterns = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/;
  const personMatch = title.match(personPatterns);
  if (personMatch && !entities.company) {
    // Avoid matching company names as people
    const name = personMatch[1];
    if (!name.includes('Inc') && !name.includes('Corp')) {
      entities.person = name;
    }
  }

  // Set subject as the first significant noun phrase
  entities.subject = title.split(/[,\-:]/).shift()?.trim();

  return entities;
}

// Generate timeframe dates
function getTimeframes() {
  const now = new Date();

  const addDays = (days) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const endOfQuarter = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3, 0);
  const endOfYear = new Date(now.getFullYear(), 11, 31);

  // Approximate next Fed meeting (roughly every 6 weeks)
  const nextFed = new Date(now);
  nextFed.setDate(nextFed.getDate() + 45);

  return {
    days14: addDays(14),
    days30: addDays(30),
    days45: addDays(45),
    days60: addDays(60),
    days90: addDays(90),
    endOfMonth: endOfMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    endOfQuarter: endOfQuarter.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    endOfYear: endOfYear.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    endOfTerm: 'end of the current Supreme Court term (June)',
    nextFedMeeting: nextFed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  };
}

// Non-news-based "evergreen" predictions
function getEvergreenPredictions() {
  const timeframes = getTimeframes();
  const month = new Date().getMonth();
  const quarter = Math.ceil((month + 1) / 3);

  const evergreen = [
    // Economic indicators
    {
      headline: 'Monthly Jobs Report Prediction',
      category: 'Business/Finance',
      source: 'Recurring',
      link: '',
      suggestion: `Prediction: The next U.S. jobs report (non-farm payrolls) will show ${randomChoice(['above', 'below'])} 150,000 jobs added. Evaluate via Bureau of Labor Statistics release.`,
      isNews: false
    },
    {
      headline: 'Inflation Trajectory',
      category: 'Business/Finance',
      source: 'Recurring',
      link: '',
      suggestion: `Prediction: Year-over-year CPI inflation will be ${randomChoice(['above', 'below'])} 3% when reported for this month. Evaluate via BLS CPI release.`,
      isNews: false
    },
    {
      headline: 'Consumer Confidence',
      category: 'Business/Finance',
      source: 'Recurring',
      link: '',
      suggestion: `Prediction: The next Consumer Confidence Index reading will ${randomChoice(['increase', 'decrease'])} from the previous month. Evaluate via Conference Board release.`,
      isNews: false
    },
    // Political
    {
      headline: 'Presidential Approval Trend',
      category: 'U.S. Politics',
      source: 'Recurring',
      link: '',
      suggestion: `Prediction: The President's approval rating (per 538 average) will be ${randomChoice(['above', 'below'])} 45% on ${timeframes.days30}. Evaluate via FiveThirtyEight tracker.`,
      isNews: false
    },
    {
      headline: 'Congressional Productivity',
      category: 'U.S. Politics',
      source: 'Recurring',
      link: '',
      suggestion: `Prediction: Congress will pass ${randomChoice(['fewer than 3', 'at least 3'])} substantive bills (excluding resolutions) by ${timeframes.endOfMonth}. Evaluate via congress.gov.`,
      isNews: false
    },
    {
      headline: 'Executive Orders',
      category: 'U.S. Politics',
      source: 'Recurring',
      link: '',
      suggestion: `Prediction: The President will sign ${randomChoice(['at least 2', 'fewer than 2'])} executive orders in the next 30 days. Evaluate via Federal Register.`,
      isNews: false
    },
    // Market-related (not simple price predictions)
    {
      headline: 'Market Volatility',
      category: 'Business/Finance',
      source: 'Recurring',
      link: '',
      suggestion: `Prediction: The VIX (volatility index) will ${randomChoice(['spike above 20', 'remain below 20'])} at least once in the next 30 days. Evaluate via CBOE VIX data.`,
      isNews: false
    },
    {
      headline: 'IPO Market Activity',
      category: 'Business/Finance',
      source: 'Recurring',
      link: '',
      suggestion: `Prediction: At least ${randomChoice(['3', '5'])} companies valued over $1B will file for IPO in Q${quarter} ${new Date().getFullYear()}. Evaluate via SEC EDGAR filings.`,
      isNews: false
    },
    {
      headline: 'Tech Sector Layoffs',
      category: 'Business/Finance',
      source: 'Recurring',
      link: '',
      suggestion: `Prediction: At least ${randomChoice(['2', '3'])} major tech companies (market cap >$10B) will announce layoffs by ${timeframes.days45}. Evaluate via company press releases.`,
      isNews: false
    },
    // Geopolitical
    {
      headline: 'UN Security Council Action',
      category: 'World Events',
      source: 'Recurring',
      link: '',
      suggestion: `Prediction: The UN Security Council will hold a vote on ${randomChoice(['Middle East', 'Ukraine', 'climate'])} related resolution by ${timeframes.days30}. Evaluate via UN press releases.`,
      isNews: false
    }
  ];

  // Filter to mostly politics and finance
  const weighted = evergreen.filter(p =>
    p.category === 'U.S. Politics' || p.category === 'Business/Finance'
  );

  return weighted.length > 0 ? weighted : evergreen;
}

function randomChoice(options) {
  return options[Math.floor(Math.random() * options.length)];
}

// ============================================
// FORMAT EMAIL
// ============================================
function formatEmail(predictions) {
  const today = formatDate(new Date());

  let html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af; margin-bottom: 5px;">📊 Daily Prediction Ideas</h1>
      <p style="color: #6b7280; margin-top: 0;">${today}</p>

      <p style="color: #374151;">Here are 5 news stories that could make interesting predictions. Consider what probability you'd assign to each outcome:</p>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
  `;

  predictions.forEach((pred, index) => {
    html += `
      <div style="margin-bottom: 25px; padding: 15px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">
          ${pred.category} • ${pred.source}
        </div>
        <h3 style="color: #111827; margin: 0 0 10px 0; font-size: 16px;">
          ${pred.headline}
        </h3>
        <p style="color: #1e40af; margin: 0; font-style: italic;">
          💡 Prediction idea: "${pred.suggestion}"
        </p>
        ${pred.link ? `<a href="${pred.link}" style="font-size: 12px; color: #6b7280;">Read article →</a>` : ''}
      </div>
    `;
  });

  html += `
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

      <p style="color: #6b7280; font-size: 14px;">
        <strong>Quick add:</strong> Go to your <a href="https://predictions.duncanheidkamp.com/admin.html" style="color: #1e40af;">Prediction Tracker</a> to add these predictions.
      </p>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
        This email was automatically generated. Adjust predictions to be specific and measurable before adding them.
      </p>
    </div>
  `;

  return html;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function extractDomain(url) {
  try {
    const matches = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
    return matches ? matches[1] : url;
  } catch (e) {
    return url;
  }
}

// ============================================
// SETUP FUNCTION - Run this once
// ============================================
function setup() {
  // Test that everything works
  Logger.log('Testing email...');

  // Send a test email
  GmailApp.sendEmail(
    CONFIG.email,
    '✅ Prediction Email Setup Complete',
    '',
    {
      htmlBody: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Setup Successful!</h2>
          <p>Your daily prediction emails are ready to go.</p>
          <p>Next step: Set up a daily trigger for the <code>sendDailyPredictions</code> function.</p>
          <ol>
            <li>Click on "Triggers" (clock icon) in the left sidebar</li>
            <li>Click "+ Add Trigger"</li>
            <li>Choose function: <strong>sendDailyPredictions</strong></li>
            <li>Choose event source: <strong>Time-driven</strong></li>
            <li>Choose type: <strong>Day timer</strong></li>
            <li>Choose time: <strong>8am to 9am</strong></li>
            <li>Click Save</li>
          </ol>
        </div>
      `,
      name: 'Prediction Tracker'
    }
  );

  Logger.log('Test email sent to ' + CONFIG.email);
}

// ============================================
// MANUAL TEST - Run this to test immediately
// ============================================
function testNow() {
  sendDailyPredictions();
}
