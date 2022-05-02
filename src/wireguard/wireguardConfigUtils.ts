import { getConfig } from './wireguard';

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

export interface PeerDataConfig {
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

export interface PeerConfig {
  title: string;
  type: string;
  data?: PeerDataConfig;
  config: PeerConfigConfig;
}

export interface WireguardConfig {
  interface: InterfaceConfig;
  peers: PeerConfig[];
}

export interface ClientConfig {
  interface: {
    type: string;
    PrivateKey: string;
    Address: string;
    DNS: string[];
  };
  peer: {
    type: string;
    PublicKey: string;
    PresharedKey: string;
    Endpoint: string;
    AllowedIPs: string;
    PersistentKeepalive: string;
  };
}

interface IPBases {
  v4: string;
  v6?: string;
}
//TODO please refactor me ;)
//TODO add keepalive and DNS for peer or server
//TODO bug is config file begins not from ###
//TODO ADD DNS by default to sever from bot config - env
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
  //TODO remove new lines if not peers
  const serializedInterface = `${serializeInterface(parsedConfig.interface)}\n\n`;

  let serializedPeers = '';
  parsedConfig.peers.forEach((peer) => {
    //TODO remove new lines at the end of array
    serializedPeers = serializedPeers + `${serializePeer(peer)}\n\n`;
  });

  return serializedInterface + serializedPeers;
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

export function serializePeer(parsedConfig: PeerConfig): string {
  const title = `### ${parsedConfig.title}\n`;
  let data = ``;
  if (parsedConfig.data?.lastUpdate) {
    data = data + `# lastUpdate = ${parsedConfig.data?.lastUpdate}\n`;
  }
  if (parsedConfig.data?.firstName) {
    data = data + `# firstName = ${parsedConfig.data?.firstName}\n`;
  }
  if (parsedConfig.data?.lastName) {
    data = data + `# lastName = ${parsedConfig.data?.lastName}\n`;
  }
  if (parsedConfig.data?.userName) {
    data = data + `# userName = ${parsedConfig.data?.userName}\n`;
  }
  if (parsedConfig.data?.userId) {
    data = data + `# userId = ${parsedConfig.data?.userId}\n`;
  }
  if (parsedConfig.data?.fileName) {
    data = data + `# fileName = ${parsedConfig.data?.fileName}\n`;
  }

  const type = `${parsedConfig.type}\n`;

  const configPublicKey = `PublicKey = ${parsedConfig.config.PublicKey}\n`;

  const configPresharedKey = `PresharedKey = ${parsedConfig.config.PresharedKey}\n`;

  let configAllowedIPs = '';
  const configAllowedIPsArray = parsedConfig.config.AllowedIPs.split(',');
  configAllowedIPsArray.forEach((address) => {
    configAllowedIPs = configAllowedIPs + `AllowedIPs = ${address}\n`;
  });

  const config = configPublicKey + configPresharedKey + configAllowedIPs;
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

export function serializeClientConfig(config: ClientConfig): string {
  const serializedInterface = `${config.interface.type}\n`;
  const serializedPrivateKey = `PrivateKey = ${config.interface.PrivateKey}\n`;

  let serializedAddress = '';
  const serializedAddressArray = config.interface.Address.split(',');
  serializedAddressArray.forEach((address) => {
    serializedAddress = serializedAddress + `Address = ${address}\n`;
  });

  const serializedPeer = `${config.peer.type}\n`;
  const serializedPublicKey = `PublicKey = ${config.peer.PublicKey}\n`;
  const serializedPresharedKey = `PresharedKey = ${config.peer.PresharedKey}\n`;
  const serializedEndpoint = `Endpoint = ${config.peer.Endpoint}\n`;

  let serializedAllowedIPs = '';
  const serializedAllowedIPsArray = config.peer.AllowedIPs.split(',');
  serializedAllowedIPsArray.forEach((address) => {
    serializedAllowedIPs = serializedAllowedIPs + `AllowedIPs = ${address}\n`;
  });

  let serializedDNS = '';
  config.interface.DNS.forEach((address) => {
    serializedDNS = serializedDNS + `DNS = ${address}\n`;
  });

  const serializedKeepAlive = `PersistentKeepalive = ${config.peer.PersistentKeepalive}\n`

  const output =
    serializedInterface +
    serializedPrivateKey +
    serializedAddress +
    serializedDNS +
    '\n' +
    serializedPeer +
    serializedPublicKey +
    serializedPresharedKey +
    serializedEndpoint +
    serializedKeepAlive +
    serializedAllowedIPs.trim();
  return output;
}

//TODO v6 without v4 not supported. De we need v6 separately?
export function extractIpBases(ipString: string): IPBases {
  const ipArray = ipString.split(',');
  let serverIpV4;
  let serverIpV6;
  switch (ipArray.length) {
    case 1:
      if (ipArray[0].includes(':')) {
        serverIpV6 = ipArray[0];
      } else {
        serverIpV4 = ipArray[0];
      }
      break;
    case 2:
      if (ipArray[0].includes(':')) {
        serverIpV6 = ipArray[0];
        serverIpV4 = ipArray[1];
      } else {
        serverIpV4 = ipArray[0];
        serverIpV6 = ipArray[1];
      }
      break;
    default:
      throw new Error('No IPs found or too many!');
  }

  const baseIpV4 = serverIpV4?.slice(0, serverIpV4.lastIndexOf('.') + 1);
  const baseIpV6 = serverIpV6?.slice(0, serverIpV6.lastIndexOf(':') + 1);

  if (!baseIpV4) {
    throw new Error('No ipV4 found');
  }

  const returnValue: IPBases = {
    v4: baseIpV4
  };
  if (baseIpV6) {
    returnValue.v6 = baseIpV6;
  }

  return returnValue;
}

export function findFirstFreeAddress(peers: PeerConfig[]): string {
  const arrayOfAddresses = peers.map((peer) => {
    const addressString = peer.config.AllowedIPs;
    const ipArray = addressString.split(',');
    let serverIpV4;
    let serverIpV6;
    switch (ipArray.length) {
      case 1:
        if (ipArray[0].includes(':')) {
          serverIpV6 = ipArray[0];
        } else {
          serverIpV4 = ipArray[0];
        }
        break;
      case 2:
        if (ipArray[0].includes(':')) {
          serverIpV6 = ipArray[0];
          serverIpV4 = ipArray[1];
        } else {
          serverIpV4 = ipArray[0];
          serverIpV6 = ipArray[1];
        }
        break;
      default:
        throw new Error('No IPs found or too many!');
    }
    const endingOfIpV4 = serverIpV4?.slice(
      serverIpV4.lastIndexOf('.') + 1,
      serverIpV4.lastIndexOf('/')
    );
    return Number(endingOfIpV4);
  });
  let freeIpNumber;
  for (let i = 2; i < 255; i++) {
    if (!arrayOfAddresses.includes(i)) {
      freeIpNumber = i;
      break;
    }
  }
  if (!freeIpNumber) {
    throw new Error('Maximum number of clients reached.');
  }
  return freeIpNumber.toString();
}

export function countSameUsersIds(peers: PeerConfig[], userId: number): number {
  const peersTimes = peers.filter((peer) => peer.data?.userId === userId.toString());
  return peersTimes.length;
}

export function getKeyFilesForUserId(peers: PeerConfig[], userId: number): string[] {
  const currenUserPeers: PeerConfig[] = peers.filter(
    (peer) => peer.data?.userId === userId.toString()
  );
  const currentUserPeersWithFileNames: PeerConfig[] = currenUserPeers.filter(
    (peer) => peer.data?.fileName
  );
  const currentUserFileNames: string[] = currentUserPeersWithFileNames.map(
    (peer) => peer.data?.fileName || ''
  );
  return currentUserFileNames;
}
