const { queue, musicTitle } = require('./utils/musicUtils');
const { playNext } = require('./play');

async function skipMusic(message) {

  try {
    queue.shift();
    musicTitle.shift();

    const voiceChannel = message.member?.voice.channel;
    await playNext(voiceChannel);
  } catch (error) {
    message.reply('음악 스킵중에 에러가 발생했어요.')
  }

}

module.exports = { skipMusic };
