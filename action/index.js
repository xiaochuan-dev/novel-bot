const { JSDOM } = require('jsdom');
const { parseCatalog, parseContent } = require('x-novel-parse');
const pLimit = require('p-limit');
const { writeFile } = require('fs/promises');
const path = require('path');
const http = require('http');
const https = require('https');

const axios = require('axios');

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

const axiosInstance = axios.create({
  httpAgent,
  httpsAgent,
});

const limit = pLimit(1);

async function getText(url) {
  const res = await axiosInstance.get(url, {
    responseType: 'arraybuffer',
    headers: {
      'user-agent':
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    },
  });

  const arrayBuffer = res.data;
  const decoder = new TextDecoder('utf-8');
  let domText = decoder.decode(arrayBuffer);

  if (domText.includes('gbk')) {
    const gbkDecoder = new TextDecoder('gbk');
    domText = gbkDecoder.decode(arrayBuffer);
  }
  return domText;
}

async function getDom(url) {
  const text = await getText(url);

  const dom = new JSDOM(text, {
    url,
  });
  const { window } = dom;
  const { document } = window;
  return {
    dom,
    window,
    document,
  };
}

async function getCatalog(url) {
  const { document } = await getDom(url);
  global.location = new URL(url);
  const res = parseCatalog(document);
  global.location = null;
  return res;
}

async function getContent(name, url) {
  const { document } = await getDom(url);
  global.location = new URL(url);
  const { trimText } = parseContent(document);
  global.location = null;

  console.log(`${url} done`);
  return `${name}\n${trimText}\n`;
}

async function start() {
  const url = process.argv[2];
  
  const catalogList = await getCatalog(url);

  const ps = catalogList.map(async({ name, url }) => {
    return limit(async() => {
      const res = await getContent(name, url);

      await new Promise(resolve => setTimeout(resolve, 200));

      return res;
    });
  });

  const texts = await Promise.all(ps);
  const t = texts.join('');

  await writeFile(path.join(__dirname, 'out.txt'), t, 'utf-8');
  console.log(`写入成功`);

}

start();
