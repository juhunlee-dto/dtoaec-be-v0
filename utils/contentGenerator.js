const LoremIpsum = require("./loremIpsum");
const { User } = require("./../models/user");
const { TextBlock } = require("./../models/textBlock");
const { ImageBlock } = require("./../models/imageBlock");

module.exports = class ContentGenerator {
  generateUserReq(appendix) {
    return {
      firstName: "firstName_" + appendix,
      lastName: "lastName_" + appendix,
      email: "dto_user" + appendix + "@dto.com",
      password: "1234!@#$QWERqwer"
    };
  }

  generateUserModel(appendix) {
    return new User(this.generateUserReq(appendix));
  }

  generateArticleBase(authorId_Str) {
    return {
      title: "This is a great test article title",
      subTitle: "The amazing way of testing node.js app",
      status: "Editing",
      author: authorId_Str
    };
  }

  generateUserInteractionReq(withId, withType, intType) {
    return {
      with: withId,
      withModel: withType,
      type: intType
    };
  }

  generateTextBlockReq(parentIdStr, numOfParagraphs = 1, isPremium = false) {
    return {
      parent: parentIdStr,
      isPremium: isPremium,
      contentType: "TextBlock",
      textContent: LoremIpsum(numOfParagraphs)
    };
  }

  generateTextBlockModel(
    authorIdStr,
    parentIdStr,
    numOfParagraphs = 1,
    isPremium = false
  ) {
    let tx = this.generateTextBlockReq(parentIdStr, numOfParagraphs, isPremium);
    tx.author = authorIdStr;
    return new TextBlock(tx);
  }

  generateImageBlockReq(parentIdStr, isPremium = false) {
    return {
      parent: parentIdStr,
      isPremium: isPremium,
      contentType: "ImageBlock",
      imageURL:
        "https://drive.google.com/file/d/1jn2r4tSNU9sVSCmF4UIdEtBjTcrGCIll/view",
      description: "D.TO Logo by Juhun Lee"
    };
  }

  generateImageBlockModel(authorIdStr, parentIdStr, isPremium = false) {
    const img = this.generateImageBlockReq(parentIdStr, isPremium);
    img.author = authorIdStr;
    return new ImageBlock(img);
  }
};

// generateImageContentBlockPlaceholder(parentIdStr, isPremium = false) {
//   return {
//     parent: parentIdStr,
//     isPremium: isPremium,
//     contentType: "Image",
//     imageURL:
//       "https://drive.google.com/file/d/1jn2r4tSNU9sVSCmF4UIdEtBjTcrGCIll/view",
//     description: "D.TO Logo by Juhun Lee"
//   };
// }
// generateVideoContentBlockPlaceholder(parentIdStr, isPremium = false) {
//   return {
//     parent: parentIdStr,
//     isPremium: isPremium,
//     contentType: "Video",
//     videoURL: "https://vimeo.com/178194135",
//     description: "a Video by Juhun Lee"
//   };
// }

// appendArticleContents(article) {
//   article.contents = [
//     this.generateImageContentBlockPlaceholder(false),
//     this.generateTextContentBlockPlaceholder(_.random(1, 3, false), false),
//     this.generateTextContentBlockPlaceholder(_.random(1, 3, false), true),
//     this.generateImageContentBlockPlaceholder(true),
//     this.generateTextContentBlockPlaceholder(1, false)
//   ];
//   return article;
// }
