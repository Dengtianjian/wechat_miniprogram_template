import config from "../config";
import http, { TBody } from "./HTTP";
import interaction from "./Interaction";
import helper from "./Helper";

type TMethods = "GET" | "POST" | "OPTIONS" | "HEAD" | "DELETE" | "PUT" | "PATCH";

class Request {
  constructor(prefix: string, baseUrl: string = null, pipes: string[] = []) {
    this.#pipes = pipes;
    this.#prefix = prefix;
    this.#baseUrl = baseUrl ?? config.APIURL;
  }
  #prefix: string = "";
  #baseUrl: string = "";
  #pipes: string[] = [];

  #joinUrl(uri: string | string[]): string {
    uri = Array.isArray(uri) ? uri : [uri];

    return [this.#prefix, ...uri].filter(item => item.trim()).join("/");
  }

  static genAttachmentUrl(fileId: string): string {
    return config.APIURL + "downloadAttachment?fileId=" + encodeURI(fileId);
  }

  pipes(pipeName: string | string[]): Request {
    this.#pipes.push(...Array.isArray(pipeName) ? pipeName : [pipeName]);
    return this;
  }
  #tokenHandle(headers: Record<string, string>): void {
    if (headers['Authorization']) {
      const token: string = headers['Authorization'];
      if (token) {
        const tokenValue: string = token.slice(0, token.lastIndexOf("/"));
        const tokenExpiration: string = (Number(token.slice(token.lastIndexOf("/") + 1)) * 1000).toString();

        if (!wx.getStorageSync("F_Token") || wx.getStorageSync("F_Token") !== tokenValue) {
          wx.setStorageSync("F_Token", tokenValue);
          wx.setStorageSync("F_TokenExpiration", tokenExpiration);
        }
      } else {
        wx.removeStorageSync("F_Token");
        wx.removeStorageSync("F_TokenExpiration");
      }
    }
  }
  send<ResponseData>(uri: string | string[] = "", method: TMethods = "GET", query: Record<string, string> = {}, body: TBody = null): Promise<ResponseData> {
    if (this.#pipes.length) {
      if (method === "GET") {
        query['_pipes'] = this.#pipes.join(",");
      } else {
        if (Array.isArray(body)) {
          query['_pipes'] = this.#pipes.join(",");
        } else if (helper.type(body) === "object") {
          // @ts-ignore
          body['_pipes'] = this.#pipes;
        }
      }
    }

    const headers: Record<string, string> = {};
    if (wx.getStorageSync("F_Token")) {
      headers["Authorization"] = `Bearer ${wx.getStorageSync("F_Token")}`;
    }

    //@ts-ignore ?????????78?????????????????? //* ?????????????????????????????????
    return http<ResponseData>(this.#baseUrl + this.#joinUrl(uri), method, query, body, headers).then(res => {
      this.#tokenHandle(res.headers);

      if (res.result) {
        return res.data;
      }

      if (res.statusCode >= 500) {
        interaction.toast("???????????????");
      }


      return res;
    }).finally(() => {
      this.#pipes = [];
    });
  }

  get<ResponseData>(uri: string | string[] = "", query: Record<string, string> = {}) {
    return this.send<ResponseData>(uri, "GET", query);
  }
  post<ResponseData>(uri: string | string[] = "", body: TBody = null, query: Record<string, string> = {}) {
    return this.send<ResponseData>(uri, "POST", query, body);
  }
  delete<ResponseData>(uri: string | string[] = "", body: TBody = null, query: Record<string, string> = {}) {
    return this.send<ResponseData>(uri, "DELETE", query, body);
  }
  patch<ResponseData>(uri: string | string[] = "", body: TBody = null, query: Record<string, string> = {}) {
    return this.send<ResponseData>(uri, "PATCH", query, body);
  }
  put<ResponseData>(uri: string | string[] = "", body: TBody = null, query: Record<string, string> = {}) {
    return this.send<ResponseData>(uri, "PUT", query, body);
  }
  upload<ResponseData = any>(uri: string | string[], filePath: string, fileName: string = "file", body: Record<string, string> = {}, task: (task: WechatMiniprogram.UploadTask) => void = null): Promise<ResponseData> {
    const url: string = this.#joinUrl(uri);
    return new Promise((resolve, reject) => {
      const uploadTask = wx.uploadFile({
        url,
        name: fileName,
        filePath,
        formData: body,
        // @ts-ignore
        success: resolve,
        fail: reject
      });
      if (task) {
        task(uploadTask);
      }
    });
  }
}

/**
 * ??????
 * @param request ????????????
 * @param breakCallback ??????????????????????????????????????????????????? true ??????????????????????????????????????????????????????????????????????????????????????????????????? true
 * @param waitDuraion ?????????????????????????????????
 * @returns ????????????
 */
export function polling<ResponseData>(request: () => Promise<ResponseData>, breakCallback: (res: ResponseData) => boolean, waitDuraion: number = 2): Promise<ResponseData> {
  let breakWhile: boolean = false;
  return new Promise(async (resolve, reject) => {
    while (breakWhile === false) {
      await new Promise<ResponseData>((resolve, reject) => {
        setTimeout(async () => {
          await request().then(res => {
            //* ????????????????????? truly ??????????????????
            breakWhile = breakCallback(res) === true;
            resolve(res);
          }).catch((err) => {
            breakWhile = true;
            reject(err);
          });
        }, waitDuraion * 1000)
      }).then(res => {
        if (breakWhile) {
          resolve(res);
        }
      }).catch(reject);
    }
  });
}

export default Request;