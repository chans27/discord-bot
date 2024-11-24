const { joinVoiceChannel } = require('@discordjs/voice');

// 음성 채널에 연결하는 함수
function connectToVoiceChannel(voiceChannel) {
  return joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });
}

module.exports = { connectToVoiceChannel };
