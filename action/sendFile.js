const FormData = require('form-data');
const { join } = require('path');
const fs = require('fs');

const token = process.env.TELEGRAM_TOKEN;

async function sendFile(filepath, chatId, rawurl) {
  const url = `https://api.telegram.org/bot${token}/sendDocument`;

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('document', fs.createReadStream(filepath));
  formData.append('caption', `${rawurl}下载完成`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('文件发送成功:', data);
  } catch (error) {
    console.error('发送文件时出错:', error);
  }
}

async function start() {
  const url = process.argv[2];
  const chatId = process.argv[3];
  await sendFile(join(__dirname, 'out.txt'), chatId, url);
}

start();
