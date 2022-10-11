import helper from "./Helper";

type TMethods = | 'OPTIONS'
  | 'GET'
  | 'HEAD'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'TRACE'
  | 'CONNECT';

export interface IResponse<ResponseData> {
  [key: string]: any,
  code: number | string,
  message: string,
  data: ResponseData,
  details: any,
  statusCode: number,
  version: string,
  result: boolean,
  headers: Record<string, string>
}

export type TBody = string | Record<string, any> | ArrayBuffer | Array<any> | null;

function http<ResponseData = any>(url: string, method: TMethods, query: Record<string, string> | null = null, body: TBody = null, header: Record<string, string> = {}): Promise<IResponse<ResponseData>> {
  method = method.toUpperCase() as TMethods;

  const headers: Record<string, string> = {
    "X-Ajax": "fetch"
  };
  for (const key in header) {
    headers[key] = header[key];
  }
  if ((!headers['content-type'] || !headers['Content-type']) && (helper.type(body) === "object" || Array.isArray(body))) {
    headers['content-type'] = "application/json"
  }

  if (url.includes("?")) {
    if (!query) {
      query = {};
    }
    const urls = url.split("?");
    url = urls[0];
    const querys: string[] = urls[1].split("&");
    querys.forEach(queryStringItem => {
      if (queryStringItem.includes("=")) {
        const keyValues: string[] = queryStringItem.split("=");
        query[keyValues[0]] = keyValues[1];
      } else {
        query[queryStringItem] = "";
      }
    });
  }
  const querys: string[] = [];
  for (const key in query) {
    querys.push(`${key}=${query[key]}`);
  }

  url += `?${querys.join("&")}`;

  return new Promise<IResponse<ResponseData>>((resolve, reject) => {
    wx.request({
      url,
      method,
      header: headers,
      data: body,
      // @ts-ignore
      success({ data, statusCode, header, cookies, profile }) {
        let responseBody: IResponse<ResponseData> = {
          statusCode,
          // @ts-ignore
          code: data.status,
          // @ts-ignore
          data,
          details: null,
          // @ts-ignore
          message: data.statusText,
          version: "",
          result: true,
          headers: header
        };

        if (responseBody.statusCode > 299) {
          responseBody['result'] = false;
          reject(responseBody);
        } else {
          responseBody['result'] = true;
          resolve(responseBody);
        }
      },
      fail: reject
    });

  });
}

export function get<ResponseData = any>(url: string, query: Record<string, string>, headers: Record<string, string> = {}) {
  return http<ResponseData>(url, "GET", query, null, headers);
}

export function post<ResponseData = any>(url: string, body: TBody = null, query: Record<string, string>, headers: Record<string, string> = {}) {
  return http<ResponseData>(url, "POST", query, body, headers);
}

export function put<ResponseData = any>(url: string, body: TBody = null, query: Record<string, string>, headers: Record<string, string> = {}) {
  return http<ResponseData>(url, "PUT", query, body, headers);
}

export function del<ResponseData = any>(url: string, body: TBody = null, query: Record<string, string>, headers: Record<string, string> = {}) {
  return http<ResponseData>(url, "DELETE", query, body, headers);
}

export default http;