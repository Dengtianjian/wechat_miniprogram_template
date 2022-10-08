import config from "../config";
import Request from "./Request";

class DiscuzXRequest extends Request {
  constructor(prefix: string, baseUrl: string = null, pipes: string[] = []) {
    baseUrl = baseUrl ?? `${config.APIURL}/plugin.php?id=${config.DiscuzXPluginId}`;
    super(prefix, baseUrl, pipes);
  }
}

export default DiscuzXRequest;