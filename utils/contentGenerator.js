const LoremIpsum = require("./loremIpsum");
const { User } = require("./../models/user");
const { TextBlock } = require("./../models/textBlock");
const { UserInteraction } = require("./../models/userInteraction");

module.exports = class ContentGenerator {
  generateUserReq(appendix, isAdmin = false) {
    return {
      firstName: "firstName_" + appendix,
      lastName: "lastName_" + appendix,
      email: "dto_user" + appendix + "@dto.com",
      password: "1234!@#$QWERqwer",
      isAdmin: isAdmin
    };
  }

  generateUserModel(appendix, isAdmin = false) {
    return new User(this.generateUserReq(appendix, isAdmin));
  }

  generateArticleReq(authorId_Str) {
    return {
      title: "This is a great test article title",
      subTitle: "The amazing way of testing node.js app",
      status: "Editing",
      author: authorId_Str
    };
  }

  generateUserInteractionReq(type, contentIdStr, contentType) {
    return {
      interactionType: type,
      interactedWith: contentIdStr,
      interactedWithType: contentType
    };
  }

  generateUserInteractionModel(userIdStr, type, contentIdStr, contentType) {
    let int = this.generateUserInteractionReq(type, contentIdStr, contentType);
    int.user = userIdStr;
    return new UserInteraction(int);
  }

  generateTextBlockReq(parentIdStr, numOfParagraphs = 1, isPremium = false) {
    return {
      parent: parentIdStr,
      isPremium: isPremium,
      contentType: "Text",
      textContent: LoremIpsum(numOfParagraphs)
    };
  }

  generateTextBlockModel(parentIdStr, numOfParagraphs = 1, isPremium = false) {
    let tx = this.generateTextBlockReq(parentIdStr, numOfParagraphs, isPremium);
    return new TextBlock(tx);
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
