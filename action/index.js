const { JSDOM } = require('jsdom');
const { parseCatalog, parseContent } = require('x-novel-parse');

async function getText(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
    },
  });

  const arrayBuffer = await res.arrayBuffer();
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

async function start() {
  const url = process.argv[2];
  const catalogUrl = url;

  const { document } = getDom(catalogUrl);


  console.log(document);
  global.location = new URL(catalogUrl);
  const res = parseCatalog(document);
  global.location = null;

  console.log(res);
}

start();
