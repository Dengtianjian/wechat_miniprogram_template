import config from "../config";
import Request from "./Request";

class DiscuzXRequest extends Request {
  constructor(prefix: string, baseUrl: string = null, pipes: string[] = []) {
    if (!config.DiscuzXPluginId) {
      throw new Error("配置文件缺少插件ID参数（DiscuzXPluginId）");
    }
    baseUrl = baseUrl ?? `${config.APIURL}/plugin.php?id=${config.DiscuzXPluginId}&uri=`;
    super(prefix, baseUrl, pipes);
  }
}

export default DiscuzXRequest;