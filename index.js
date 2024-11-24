require('dotenv').config(); // .env 파일 불러오기
global.ReadableStream = require('web-streams-polyfill').ReadableStream;

const { Client, GatewayIntentBits } = require('discord.js');
const ytdl = require("@distube/ytdl-core"); // 유튜브 재생관련 라이브러리
const { playMusic } = require('./src/play');
const { checkPlaylist } = require('./src/playlist');
const { skipMusic} = require('./src/skipMusic')


// Discord API에 연결하고 이벤트 처리하기 위한 객체
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // 서버 관련
    GatewayIntentBits.GuildVoiceStates, // 음성 채널 관련
    GatewayIntentBits.GuildMessages, // 채팅 메시지 관련
    GatewayIntentBits.MessageContent, // 채팅 메세지 읽는 권한
  ],
});

/**
 * 실행 후 준비되었을 때
 */
client.once('ready', () => {
  console.log(`${client.user.tag}이 로그인했어요!`);
});

/**
 * 디스코드 내에서 메세지를 입력했을 때
 */
client.on('messageCreate', async (message) => {

  if (message.author.bot) return;

  if (message.content.startsWith('!재생 ') || message.content.startsWith('!play ')) {
      await playMusic(message);
  } else if (message.content === '!대기열' || message.content === '!목록' || message.content === '!list') {
    await checkPlaylist(message);
  } else if (message.content === '!다음' || message.content === '!next' || message.content === '!skip') {
    await skipMusic(message);
  }

});

client.login(process.env.DISCORD_BOT_TOKEN);
