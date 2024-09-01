const puppeteer = require('puppeteer');
const xlsx = require('xlsx'); // Import the xlsx library to handle Excel files

async function scrapeGoogleMaps() {
  const url = '<YOUR_GOOGLE_MAPS_URL>'; // Replace this with the actual URL you want to scrape

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });  // Run in headless mode
  const page = await browser.newPage();

  console.log('Navigating to main URL...');
  await page.goto(url, { waitUntil: 'networkidle2' });

  console.log('Scrolling to load more results using "Page Down"...');
  const maxPageDowns = 1; // Set maximum Page Down key presses; typically, each Page Down loads ~5 results
  const scrollDelay = 1000; // Delay between each Page Down key press
  let pageDownAttempts = 0;

  // Scroll the page using the "Page Down" key to load more results
  try {
    while (pageDownAttempts < maxPageDowns) {
      console.log(`Page Down attempt ${pageDownAttempts + 1}...`);
      await page.keyboard.press('PageDown'); // Press the "Page Down" key

      // Wait for new content to load after each key press
      await new Promise(resolve => setTimeout(resolve, scrollDelay)); 

      pageDownAttempts++;
    }
    console.log('Finished scrolling or reached maximum attempts.');
  } catch (error) {
    console.error('Error while scrolling using "Page Down":', error);
  }

  console.log('Extracting search results...');
  const data = await page.content();

  // Regular expression to extract search result elements
  const resultPattern = /<a[^>]+class="[^"]*hfpxzc[^"]*"[^>]+aria-label="([^"]+)"[^>]+href="([^"]+)"/g;
  const results = [];
  let match;

  // Loop through the matches to extract names and URLs
  while ((match = resultPattern.exec(data)) !== null) {
    const name = match[1];
    let resultUrl = match[2];

    if (!resultUrl.startsWith('http')) {
      resultUrl = `https://www.google.com.au${resultUrl}`;
    }

    results.push({
      name: name,
      url: resultUrl
    });
  }

  console.log(`Found ${results.length} results. Starting to scrape each result...`);

  // Initialize an array to hold the data for the Excel file
  const excelData = [];

  for (const [index, result] of results.entries()) {
    console.log(`\nScraping details for: ${result.name} (${index + 1}/${results.length})`);
    try {
      console.log(`Navigating to ${result.url}...`);
      await page.goto(result.url, { waitUntil: 'networkidle2', timeout: 60000 });  // Increased timeout to 60 seconds
      console.log('Page loaded. Looking for details...');

      // Extract the address
      const address = await page.$eval('button[data-item-id="address"]', button => button.getAttribute('aria-label').replace('Address: ', '').trim()).catch(() => 'Not found');
      
      // Extract the website
      const website = await page.$eval('a[aria-label^="Website:"]', a => a.getAttribute('href')).catch(() => 'Not found');

      console.log(`Name: ${result.name}`);
      console.log(`URL: ${result.url}`);
      console.log(`Address: ${address}`);
      console.log(`Website: ${website}`);

      // If a website is found, navigate to it and look for an email address
      let email = 'Not found';
      if (website !== 'Not found') {
        console.log(`Navigating to website: ${website}...`);
        try {
          await page.goto(website, { waitUntil: 'networkidle2', timeout: 60000 });

          console.log('Website loaded. Searching for email addresses...');

          // Extract email addresses from mailto links
          const mailtoEmails = await page.$$eval('a[href^="mailto:"]', anchors =>
            anchors.map(anchor => anchor.getAttribute('href').replace('mailto:', '').trim())
          );

          // Regex pattern to search for emails in the text content
          const pageText = await page.evaluate(() => document.body.innerText);
          const regexEmailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          const textEmails = pageText.match(regexEmailPattern) || [];

          // Combine and deduplicate emails
          const allEmails = [...new Set([...mailtoEmails, ...textEmails])];
          email = allEmails.length > 0 ? allEmails.join(', ') : 'Not found';

          console.log(`Email(s) found: ${email}`);
        } catch (error) {
          console.error(`Error navigating to website: ${error.message}`);
        }
      }

      console.log(`Email: ${email}`);

      // Add the collected data to the excelData array
      excelData.push({
        Name: result.name,
        Address: address,
        Website: website,
        Email: email
      });

    } catch (error) {
      console.error(`Error scraping ${result.name}: ${error.message}`);
    }
    console.log('---------------------------');
  }

  console.log('Scraping completed. Closing browser...');
  await browser.close();  // Close the Puppeteer browser

  // Create and write the Excel file
  const workbook = xlsx.utils.book_new(); // Create a new workbook
  const worksheet = xlsx.utils.json_to_sheet(excelData); // Convert the data to a worksheet
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Results'); // Append the worksheet to the workbook

  // Write the Excel file to disk
  xlsx.writeFile(workbook, 'GoogleMapsResults.xlsx'); 
  console.log('Excel file "GoogleMapsResults.xlsx" has been created successfully.');
}

// Execute the scraping function and handle errors
scrapeGoogleMaps().catch(console.error);
