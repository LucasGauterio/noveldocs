
import VueCookies from 'vue-cookies'


class UtilsGoogleApi {


  static async createFolder(name, parentFolderId) {
    console.log(`create folder ${name}`);
    let response = await gapi.client.drive.files.create({
      name: name,
      mimeType: "application/vnd.google-apps.folder",
      fields: "id, name",
      parents: parentFolderId ? [parentFolderId] : [],
    });
    console.log(`created folder ${name} response`, response.result.id);

    return response.result;
  }

  static async createDocument(name, parentFolderId) {
    var fileMetadata = {
      name: name,
      mimeType: "application/vnd.google-apps.document",
      parents: [parentFolderId],
      published: true,
      publishedOutsideDomain: true,
      publishAuto: true
    };
    let response = await gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: "id",
    });
    console.log(`created document ${name} response`, response.result.id);
    return response.result;
  }

  static async createJson(name, parentFolderId, content) {
    const jsonContent = JSON.stringify(content);
    console.log("content", jsonContent);

    var file = new Blob([jsonContent], { type: "text/plain" });
    var metadata = {
      name: `${name}.json`,
      mimeType: "text/plain",
      parents: [parentFolderId],
    };

    var accessToken = gapi.auth.getToken().access_token;
    var form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    let response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: new Headers({ Authorization: "Bearer " + accessToken }),
        body: form,
      }
    );
    let body = await response.json();
    return { id: body.id, name: metadata.name };
  }

  static async updateJson(id, content) {
    const jsonContent = JSON.stringify(content);
    
    console.log("content", jsonContent);

    var accessToken = gapi.auth.getToken().access_token;

    let response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`,
      {
        method: "PATCH",
        headers: new Headers({ Authorization: "Bearer " + accessToken }),
        body: jsonContent,
      }
    );
    let body = await response.json();
    return { id: body.id };
  }

  static async getFiles(pageToken) {
    let response = await gapi.client.drive.files.list({
      pageSize: 50,
      pageToken: pageToken,
      fields: "nextPageToken, files(id, name)",
    });
    let files = response.result.files;
    const nextPageToken = response.result.nextPageToken;

    if (nextPageToken) files = files.concat(await this.getFiles(nextPageToken));

    return files;
  }
  static async getFileByName(name, pageToken) {
    let file = getFiles(pageToken).find((file) => file.name === name);
    return file;
  }

  static async getJson(id) {

    const response = await gapi.client.drive.files.get({
      fileId: id,
      alt: "media",
    });
    const jsonObject = JSON.parse(response.body);
    return jsonObject;
  }

  static async getNovelDocs(url) {
    var idToken = VueCookies.get("credential");
    var body;
    try{
      let response = await fetch(
        url+"/api/",
        {
          method: "GET",
          headers: new Headers({ Authorization: "Bearer " + idToken })
        }
      );
      body = await response.json()
    }catch(err){
      console.log("NovelDocs not found")
    }
    return body;
  }

  static async postNovelDocs(url,content) {
    const jsonContent = JSON.stringify(content);
    var idToken = VueCookies.get("credential");
    let body;
    try{
      let response = await fetch(
        url+"/api/",
        {
          method: "POST",
          headers: new Headers({ Authorization: "Bearer " + idToken , "Content-Type": "application/json"}),
          body: jsonContent,
        }
      );
      body = await response.json();
    }catch(err){
      console.error("NovelDocs error", err)
    }
    return body;
  }


  static async putNovelDocs(url,content) {
    const jsonContent = JSON.stringify(content);
    var idToken = VueCookies.get("credential");
    let body;
    //let api = "https://noveldocsapi-651036b336f1.herokuapp.com";
    try{
      let response = await fetch(
        url+"/api/",
        {
          method: "PUT",
          headers: new Headers({ Authorization: "Bearer " + idToken , "Content-Type": "application/json"}),
          body: jsonContent,
        }
      );
      body = await response.json();
    }catch(err){
      console.error("NovelDocs error", err)
    }
    return body;
  }

  
  static async deleteFile(id) {
    let response;
    try{
        response = await gapi.client.drive.files.delete({
            fileId: id
        })
        console.log(`DELETED file ${id}`)
        return response.result
    }catch(err){
        console.log(err.message)
    }
  }
}

export default UtilsGoogleApi;
