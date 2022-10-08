const envMode: string = wx.getAccountInfoSync().miniProgram.envVersion;

interface IConfig {
  APIURL: string,
  DiscuzXPluginId: string
}

const base: IConfig = {
  APIURL: "http://127.0.0.2",
  DiscuzXPluginId: "gstudio_super_app"
}

const develop: IConfig = {
  ...base
}

const release: IConfig = {
  ...base,
  APIURL: "https://api.cooocc.com"
}

const config: Record<string, IConfig> = {
  develop,
  release
}

export default config[envMode];