const ytdl = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg');
const search = require('yt-search');


var results = await search(q);
var videoId = results.videos[0].videoId;
var infovid = await ytdl.getInfo(videoId);
var title = infovid.videoDetails.title.replace(/[^\w\s]/gi, '');
var thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
var url = infovid.videoDetails.video_url;
var duration = parseInt(infovid.videoDetails.lengthSeconds);
var uploadDate = new Date(infovid.videoDetails.publishDate).toLocaleDateString();
var minutes = Math.floor(duration / 60);
var description = results.videos[0].description;
var seconds = duration % 60;
var durationText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
var audio = ytdl(videoId, {
    quality: 'highestaudio'
});
var inputFilePath = './tmp/' + title + '.webm';
var outputFilePath = './tmp/' + title + '.mp3';
var infoText = `◦ *Titulo*: ${title}\n◦ *Duração*: ${durationText}\n◦ *Upload*: ${uploadDate}\n◦ *ID*: ${videoId}\n◦ *Descrição*: ${description}\n◦ *URL*: ${url}
          `;
client.relayMessage(from, {
    extendedTextMessage: {
        text: infoText,
        contextInfo: {
            externalAdReply: {
                title: "@amiso",
                body: "",
                mediaType: 1,
                previewType: 0,
                renderLargerThumbnail: true,
                thumbnailUrl: thumbnailUrl,
                sourceUrl: url
            }
        },
        quoted: live
    },
}, {});

audio.pipe(fs.createWriteStream(inputFilePath)).on('finish', async () => {
    ffmpeg(inputFilePath)
        .toFormat('mp3')
        .on('end', async () => {
            let buffer = fs.readFileSync(outputFilePath);
            client.sendMessage(from, {
                audio: buffer,
                mimetype: 'audio/mpeg'
            }, {
                quoted: live
            });
            fs.unlinkSync(inputFilePath);
            fs.unlinkSync(outputFilePath);
        })
        .on('error', (err) => {
            console.log(err);
            reply(`Erro ao converter o audio`);
            fs.unlinkSync(inputFilePath);
            fs.unlinkSync(outputFilePath);
        })
        .save(outputFilePath);
});