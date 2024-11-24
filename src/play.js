/**
 * !재생 또는 !play 입력 했을때의 로직 처리
 */
const { connectToVoiceChannel } = require('./connect');
const { createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const { queue, musicTitle } = require('./utils/musicUtils');

async function playMusic(message) {
  const url = message.content.split(' ')[1]; // 유튜브 URL 추출

  if (!ytdl.validateURL(url)) {
    message.reply('유효하지 않은 URL입니다.');
    return;
  }

  const voiceChannel = message.member?.voice.channel;
  if (!voiceChannel) {
    message.reply('음악을 재생하려면 음성채널에 접속해야 해요!');
    return;
  }

  try {
    // 곡을 대기열에 추가
    queue.push(url);
    ytdl.getInfo(url).then(info => {
      const title = info.videoDetails.title;
      musicTitle.push(title);
      console.log("제목: ", title);
    }).catch(error => {
      console.error("제목 취득 실패에러 ", error);
    });

    if (queue.length === 1) {
      await playNext(voiceChannel);
      message.reply(`곡이 대기열에 추가되었습니다: ${url}`);
    }
  } catch (error) {
    console.error('음악 재생 에러 발생 :', error);
    message.reply('음악 재생 시도중에 에러가 발생했어요.');
  }
}

async function playNext(voiceChannel) {
  if (queue.length === 0) {
    console.log('대기열이 비었습니다.');
    return;
  }

  const url = queue[0];  // 대기열의 첫 번째 곡
  const connection = connectToVoiceChannel(voiceChannel);

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

  player.on('idle', () => {
    queue.shift();
    musicTitle.shift();
    playNext(voiceChannel);  // 다음 곡을 재생
  });
}

module.exports = { playMusic , playNext };
