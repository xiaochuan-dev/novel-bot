const FormData = require('form-data');
const { join } = require('path');
const fs = require('fs');
const axios = require('axios');

const token = process.env.TELEGRAM_TOKEN;

async function sendFile(filepath, chatId, rawurl) {
  const url = `https://api.telegram.org/bot${token}/sendDocument`;

  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('document', fs.createReadStream(filepath));
  formData.append('caption', `${rawurl}下载完成`);

  const response = await axios.post(url, formData, {
    headers: {
      ...formData.getHeaders(),
    },
  });

  const data = response.data;
  console.log('文件发送成功:', data);
}

async function start() {
  const url = process.argv[2];
  const chatId = parseInt(process.argv[3]);
  await sendFile(join(__dirname, 'out.txt'), chatId, url);
}

start();
