interface DynamicObject {
  [key: string]: string | undefined;
}

interface ConfigWithAdditionalData {
  title: string;
  type: string;
  config: string;
  data: string;
}

interface InterfaceDataConfig {
  lastUpdate?: string;
}

interface InterfaceConfigConfig {
  PrivateKey: string;
  Address: string;
  ListenPort: string;
  PostUp: string;
  PostDown: string;
}

interface InterfaceConfig {
  title: string;
  type: string;
  data?: InterfaceDataConfig;
  config: InterfaceConfigConfig;
}

interface PeerDataConfig {
  userId?: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  lastUpdate?: string;
  fileName?: string;
}

interface PeerConfigConfig {
  PublicKey: string;
  PresharedKey: string;
  AllowedIPs: string;
}

interface PeerConfig {
  title: string;
  type: string;
  data?: PeerDataConfig;
  config: PeerConfigConfig;
}

interface WireguardConfig {
  interface: InterfaceConfig;
  peers: PeerConfig[];
}

//TODO add keepalive and DNS for peer or server
export function parseWireguardConfig(wireguardConfigString: string): WireguardConfig {
  const commentedParts = wireguardConfigString.split(/(?=###)/g);
  const interfaceString = commentedParts[0].trim();
  const peersArray = commentedParts.slice(1).map((value) => value.trim());

  const extractedInterface: ConfigWithAdditionalData =
    extractConfigAndAdditionalInformation(interfaceString);

  const parsedInterfaceData = parseTypicalConfig(extractedInterface.data);
  const parsedInterfaceConfig = parseTypicalConfig(extractedInterface.config);

  const parsedPeersConfigs = peersArray.map((peerRawData) => {
    const extractedPeer: ConfigWithAdditionalData =
      extractConfigAndAdditionalInformation(peerRawData);

    const parsedPeerData = parseTypicalConfig(extractedPeer.data);
    const parsedPeerConfig = parseTypicalConfig(extractedPeer.config);
    const output: PeerConfig = {
      title: extractedPeer.title,
      type: extractedPeer.type,
      data: {
        userName: parsedPeerData.userName,
        firstName: parsedPeerData.firstName,
        lastName: parsedPeerData.lastName,
        userId: parsedPeerData.userId,
        lastUpdate: parsedPeerData.lastUpdate,
        fileName: parsedPeerData.fileName
      },
      config: {
        PublicKey: parsedPeerConfig.PublicKey || '',
        PresharedKey: parsedPeerConfig.PresharedKey || '',
        AllowedIPs: parsedPeerConfig.AllowedIPs || ''
      }
    };
    return output;
  });

  const parserInterfaceConfig: InterfaceConfig = {
    title: extractedInterface.title,
    type: extractedInterface.type,
    data: {
      lastUpdate: parsedInterfaceData.lastUpdate
    },
    config: {
      PrivateKey: parsedInterfaceConfig.PrivateKey || '',
      Address: parsedInterfaceConfig.Address || '',
      ListenPort: parsedInterfaceConfig.ListenPort || '',
      PostUp: parsedInterfaceConfig.PostUp || '',
      PostDown: parsedInterfaceConfig.PostDown || ''
    }
  };

  return {
    interface: parserInterfaceConfig,
    peers: parsedPeersConfigs
  };
}

export function serializeWireguardConfig(parsedConfig: WireguardConfig): string {
  return '';
}

export function serializeInterface(parsedConfig: InterfaceConfig): string {
  const title = `### ${parsedConfig.title}\n`;
  let data = ``;
  if (parsedConfig.data?.lastUpdate) {
    data = `# lastUpdate = ${parsedConfig.data?.lastUpdate}\n`;
  }
  const type = `${parsedConfig.type}\n`;

  const configPrivateKey = `PrivateKey = ${parsedConfig.config.PrivateKey}\n`;

  let configAddress = '';
  const configAddressArray = parsedConfig.config.Address.split(',');
  configAddressArray.forEach((address) => {
    configAddress = configAddress + `Address = ${address}\n`;
  });

  const configListenPort = `ListenPort = ${parsedConfig.config.ListenPort}\n`;

  let configPostUp = '';
  const configPostUpArray = parsedConfig.config.PostUp.split(',');
  configPostUpArray.forEach((PostUp) => {
    configPostUp = configPostUp + `PostUp = ${PostUp}\n`;
  });

  let configPostDown = '';
  const configPostDownArray = parsedConfig.config.PostDown.split(',');
  configPostDownArray.forEach((PostDown) => {
    configPostDown = configPostDown + `PostDown = ${PostDown}\n`;
  });

  const config =
    configPrivateKey + configAddress + configListenPort + configPostUp + configPostDown;
  return title + data + type + config.trim();
}

export function serializePeer(parsedConfig: InterfaceConfig): string {
  const title = `### ${parsedConfig.title}\n`;
  let data = ``;
  if (parsedConfig.data?.lastUpdate) {
    data = `# lastUpdate = ${parsedConfig.data?.lastUpdate}\n`;
  }
  const type = `${parsedConfig.type}\n`;

  const configPrivateKey = `PrivateKey = ${parsedConfig.config.PrivateKey}\n`;

  let configAddress = '';
  const configAddressArray = parsedConfig.config.Address.split(',');
  configAddressArray.forEach((address) => {
    configAddress = configAddress + `Address = ${address}\n`;
  });

  const configListenPort = `ListenPort = ${parsedConfig.config.ListenPort}\n`;

  let configPostUp = '';
  const configPostUpArray = parsedConfig.config.PostUp.split(',');
  configPostUpArray.forEach((PostUp) => {
    configPostUp = configPostUp + `PostUp = ${PostUp}\n`;
  });

  let configPostDown = '';
  const configPostDownArray = parsedConfig.config.PostDown.split(',');
  configPostDownArray.forEach((PostDown) => {
    configPostDown = configPostDown + `PostDown = ${PostDown}\n`;
  });

  const config =
    configPrivateKey + configAddress + configListenPort + configPostUp + configPostDown;
  return title + data + type + config.trim();
}

export function parseTypicalConfig(interfaceConfigString: string) {
  const strings = interfaceConfigString.split(/\r?\n/);
  const obj: DynamicObject = {};
  strings.forEach((string) => {
    const parts = string.split(' = ');
    const key = parts[0];
    const val = parts[1];
    if (obj[key]) {
      obj[key] = (obj[key] as string).concat(',', val);
    } else {
      obj[key] = val;
    }
  });
  return obj;
}

export function extractConfigAndAdditionalInformation(input: string): ConfigWithAdditionalData {
  const parts = input.split(/(?=\n### )|(?=\n# )|(?=\n\[Interface\])|(?=\n\[Peer\])/g);
  const clearedParts = parts.map((string) => string.trim());
  let title;
  const maybeTitle = clearedParts[0];
  if (maybeTitle.includes('###')) {
    title = clearedParts.shift()?.replace('### ', '').trim();
  }
  const dataStrings = clearedParts.filter((string) => string[0] === '#');
  const clearedDataStrings = dataStrings.map((string) => string.replace('# ', '').trim());
  const data = clearedDataStrings.join('\n');
  const type = parts[parts.length - 1].trim().split('\n')[0].trim();
  const config = parts[parts.length - 1].replace('[Interface]', '').replace('[Peer]', '').trim();
  return {
    title: title || '',
    type,
    data,
    config
  };
}
