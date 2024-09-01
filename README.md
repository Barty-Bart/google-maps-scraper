# google-maps-scraper

This project is a Node.js script that scrapes data from Google Maps search results, including names, addresses, websites, and email addresses of businesses. The data is then exported to a formatted Excel file.

## Prerequisites

- **Node.js**: Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

## Installation

**Clone the Repository**:
```bash
git clone https://github.com/Barty-Bart/google-maps-scraper.git
cd google-maps-scraper
```

## Install Dependencies

Initialize a new Node.js project and install the required packages:

```bash
npm install puppeteer xlsx
```

## Usage

### Edit the Script

Open the scraper.js file and replace the placeholder <YOUR_GOOGLE_MAPS_URL> with the actual Google Maps URL you want to scrape. For example:

```bash
const url = 'https://www.google.com.au/maps/search/car/@-37.951212,145.0856202,13z?entry=ttu&g_ep=EgoyMDI0MDgyOC4wIKXMDSoASAFQAw%3D%3D';
```

### Run the Script:

Run the following command in your terminal:

```bash
node scraper.js
```

### Output

The script will generate an Excel file named GoogleMapsResults.xlsx in the same directory. This file will contain the scraped data with columns: Name, Address, Website, and Email.

## Notes

- Page Down and Results: Typically, each "Page Down" press loads about 5 results, but this can vary depending on the page and your viewport size.
- File Output Location: The GoogleMapsResults.xlsx file will be saved in the same directory as your script, and it will be immediately visible in your file explorer or IDE.
