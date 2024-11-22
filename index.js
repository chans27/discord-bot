require('dotenv').config(); // .env 파일 불러오기
global.ReadableStream = require('web-streams-polyfill').ReadableStream;

const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require("@distube/ytdl-core"); // 유튜브 재생관련 라이브러리

// Discord API에 연결하고 이벤트 처리하기 위한 객체
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // 서버 관련
    GatewayIntentBits.GuildVoiceStates, // 음성 채널 관련
    GatewayIntentBits.GuildMessages, // 채팅 메시지 관련
    GatewayIntentBits.MessageContent, // 채팅 메세지 읽는 권한
  ],
});

// 재생 대기열 관리
let queue = []; // 플레이 리스트
let musicTitle = []; // 플레이리스트에 추가되는 제목
let currentPlayer = null; // 현재 재생중인 플레이어(곡)

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

  // 1. !재생 명령어 입력한 경우
  if (message.content.startsWith('!재생 ') || message.content.startsWith('!play ')) {
      const url = message.content.split(' ')[1]; // 유튜브 URL 추출

    // 유튜브 URL 검증
    if (!ytdl.validateURL(url)) {
      message.reply('유효하지 않은 URL입니다.');
      return;
    }

    // 음성채널에 접속했는지 검증
    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) {
      message.reply('음악을 재생하려면 음성채널에 접속해야 해요!');
      return;
    }

    try {

      // 곡을 대기열에 추가
      queue.push(url);
      ytdl.getInfo(url).then(info => {
        const title = info.videoDetails.title; // 동영상 제목
        musicTitle.push(title)
        console.log("제목: ", title);
      }).catch(error => {
        console.error("제목 취득 실패에러 ", error);
      });

      if (queue.length === 1) {  // 대기열에 첫 곡이 추가되었을 때만 연결 시작
        await playNext(voiceChannel); // 첫 번째 곡부터 재생
        message.reply(`곡이 대기열에 추가되었습니다: ${url}`);
      }
    } catch (error) {
      console.error('에러 발생 :', error);
      message.reply('음악 재생 시도중에 에러가 발생했어요.');
    }
  }

  // 2. !대기열 입력한 경우
  if (message.content === '!대기열' || message.content === '!목록' || message.content === '!list') {
      if (queue.length === 1) {
      message.reply('현재 대기열에 곡이 없습니다.');
    } else {
        // 플레이 리스트 창 인터페이스
        const embed = {
          color: 0x0099ff,  // Embed 색상
          title: '플레이 리스트',
          description: queue.length === 1 ?
            `현재 대기 중인 곡: **${musicTitle[0]}**` :
            `대기 중인 곡들:\n${musicTitle.slice(1).map((title, index) => `${index + 1}. ${title}`).join('\n')}`,
          timestamp: new Date(),
      };
        message.reply({ embeds: [embed] });
      }
  }

});

async function playNext(voiceChannel) {
  if (queue.length === 0) {
    console.log('대기열이 비었습니다.');
    return;
  }

  const url = queue[0];  // 대기열의 첫 번째 곡
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  const player = createAudioPlayer();
  const stream = ytdl(url, {
    filter: 'audioonly',
    highWaterMark: 1 << 25,
    requestOptions: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      },
    },
  });
  const resource = createAudioResource(stream);

  player.play(resource);
  connection.subscribe(player);

  // 재생이 끝났을 때 다음 곡을 재생
  player.on('idle', () => {
    queue.shift();  // 첫 번째 곡을 대기열에서 제거
    musicTitle.shift()
    playNext(voiceChannel);  // 다음 곡을 재생
  });

  currentPlayer = player;
}

client.login(process.env.DISCORD_BOT_TOKEN);
