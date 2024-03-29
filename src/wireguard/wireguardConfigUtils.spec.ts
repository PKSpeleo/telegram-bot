import {
  ClientConfig,
  countSameUsersIds,
  extractConfigAndAdditionalInformation,
  extractIpsFromAddressString,
  findFirstIPAddresses,
  getKeyFilesForUserId,
  parseTypicalConfig,
  parseWireguardConfig,
  PeerConfig,
  serializeClientConfig,
  serializeInterface,
  serializePeer,
  serializeWireguardConfig,
  WireguardConfig
} from './wireguardConfigUtils';

//TODO please refactor me ;)
describe('wireguardConfigUtils', () => {
  describe('Parsing', () => {
    describe('parseWireguardConfig', () => {
      test('should parse config', () => {
        const result = parseWireguardConfig(mockedConfig);
        expect(result).toEqual(parsedConfig);
      });
    });

    describe('parseTypicalConfig', () => {
      test('should original parse interface', () => {
        const result = parseTypicalConfig(originalInterface);
        expect(result).toEqual(parsedInterface);
      });

      test('should parse original peer', () => {
        const result = parseTypicalConfig(originalPeer);
        expect(result).toEqual(parsedPeer);
      });
    });

    describe('extractConfigAndAdditionalInformation', () => {
      test('should extract interface with additional data', () => {
        const result = extractConfigAndAdditionalInformation(interfaceWithAdditionalData);
        expect(result).toEqual(extractedInterfaceWithAdditionalData);
      });

      test('should extract peer with additional data', () => {
        const result = extractConfigAndAdditionalInformation(peerWithAdditionalInformation);
        expect(result).toEqual(extractedPeerWithAdditionalInformation);
      });

      test('should extract peer without additional data', () => {
        const result = extractConfigAndAdditionalInformation(clearPeerWithAdditionalInformation);
        expect(result).toEqual(extractedClearPeerWithAdditionalInformation);
      });
    });

    describe('Circular test', () => {
      test('should parse and serialize to the same config', () => {
        const parsed = parseWireguardConfig(mockedConfig);
        const serialized = serializeWireguardConfig(parsed);
        expect(serialized).toEqual(mockedConfig);
      });
    });
  });

  describe('Serializing', () => {
    describe('serializeWireguardConfig', () => {
      test('should create correct config from object', () => {
        const result = serializeWireguardConfig(parsedConfig);
        expect(result).toEqual(mockedConfig);
      });
    });

    describe('serializeInterface', () => {
      test('should create correct interface config from object', () => {
        const result = serializeInterface(parsedInterfaceConfig);
        expect(result).toEqual(serializedInterfaceConfig);
      });
    });

    describe('serializePeer', () => {
      test('should create correct peer config from object', () => {
        const result = serializePeer(parsedPeerConfig);
        expect(result).toEqual(serializedPeerConfig);
      });
    });

    describe('serializeClientConfig', () => {
      test('should create correct client config from object', () => {
        const result = serializeClientConfig(parsedClientConfig);
        expect(result).toEqual(serializedClientConfig);
      });
    });
  });

  describe('extractIpsFromAddressString', () => {
    test('should extract correct ips', () => {
      const result = extractIpsFromAddressString('10.66.66.2/32,fd42:42:42::2/128');
      expect(result).toEqual({
        ipV4: '10.66.66.2',
        ipV6: 'fd42:42:42::2'
      });
    });

    test('should extract correct ips from reverse', () => {
      const result = extractIpsFromAddressString('fd42:42:42::fff/128,10.66.62.250/32');
      expect(result).toEqual({
        ipV4: '10.66.62.250',
        ipV6: 'fd42:42:42::fff'
      });
    });
  });

  describe('findFirstFreeAddresses', () => {
    test('should find last free ip', () => {
      const result = findFirstIPAddresses(parsedConfig);
      expect(result).toEqual({
        ipV4: '10.66.66.6',
        ipV6: 'fd42:42:42:0:0:0:0:6'
      });
    });

    test('should find free ip in the middle', () => {
      const result = findFirstIPAddresses(parsedConfigWithoutThird);
      expect(result).toEqual({
        ipV4: '10.66.66.3',
        ipV6: 'fd42:42:42:0:0:0:0:3'
      });
    });
  });

  describe('countSameUsersIds', () => {
    test('should find 0 users', () => {
      const result = countSameUsersIds(parsedConfigWithoutThird.peers, 333);
      expect(result).toEqual(0);
    });

    test('should find 1 users', () => {
      const result = countSameUsersIds(parsedConfigWithoutThird.peers, 111);
      expect(result).toEqual(1);
    });

    test('should find 2 users', () => {
      const result = countSameUsersIds(parsedConfigWithoutThird.peers, 222);
      expect(result).toEqual(2);
    });
  });

  describe('getKeyFilesForUserId', () => {
    test('should find 0 fileNames', () => {
      const result = getKeyFilesForUserId(
        [
          { data: { userId: '111', fileName: '111_1.conf' } },
          { data: { userId: '222', fileName: '222_1.conf' } },
          { data: { userId: '222', fileName: '222_2.conf' } }
        ] as PeerConfig[],
        333
      );
      expect(result).toEqual([]);
    });

    test('should find 1 fileNames', () => {
      const result = getKeyFilesForUserId(
        [
          { data: { userId: '111', fileName: '111_1.conf' } },
          { data: { userId: '222', fileName: '222_1.conf' } },
          { data: { userId: '222', fileName: '222_2.conf' } }
        ] as PeerConfig[],
        111
      );
      expect(result).toEqual(['111_1.conf']);
    });

    test('should find 2 fileNames', () => {
      const result = getKeyFilesForUserId(
        [
          { data: { userId: '111', fileName: '111_1.conf' } },
          { data: { userId: '222', fileName: '222_1.conf' } },
          { data: { userId: '222', fileName: '222_2.conf' } }
        ] as PeerConfig[],
        222
      );
      expect(result).toEqual(['222_1.conf', '222_2.conf']);
    });
  });
});

const interfaceWithAdditionalData = `### Do not edit this file manually!
# customPropertyOne = tru-la-la
# customPropertyTwo = la-la-tru
[Interface]
PrivateKey = afsfsfasfakljfsda;ljfjal;sfjlajsfjasldf
Address = 10.66.66.1/24
Address = fd42:42:42::1/64
ListenPort = 57418
PostUp = iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i wg0 -j ACCEPT
PostUp = ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i eth0 -o wg0 -j ACCEPT
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i wg0 -j ACCEPT
PostDown = ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE`;

const extractedInterfaceWithAdditionalData = {
  title: `Do not edit this file manually!`,
  data: `customPropertyOne = tru-la-la
customPropertyTwo = la-la-tru`,
  type: `[Interface]`,
  config: `PrivateKey = afsfsfasfakljfsda;ljfjal;sfjlajsfjasldf
Address = 10.66.66.1/24
Address = fd42:42:42::1/64
ListenPort = 57418
PostUp = iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i wg0 -j ACCEPT
PostUp = ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i eth0 -o wg0 -j ACCEPT
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i wg0 -j ACCEPT
PostDown = ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE`
};

const peerWithAdditionalInformation = `### Client NL_PK_Mac
# customPropertyOne = tru-la-la-1
# customPropertyTwo = la-la-tru-2
[Peer]
PublicKey = dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf
PresharedKey = asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf
AllowedIPs = 10.66.66.2/32,fd42:42:42::2/128
`;

const extractedPeerWithAdditionalInformation = {
  title: `Client NL_PK_Mac`,
  data: `customPropertyOne = tru-la-la-1
customPropertyTwo = la-la-tru-2`,
  type: `[Peer]`,
  config: `PublicKey = dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf
PresharedKey = asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf
AllowedIPs = 10.66.66.2/32,fd42:42:42::2/128`
};

const clearPeerWithAdditionalInformation = `[Peer]
PublicKey = dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf
PresharedKey = asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf
AllowedIPs = 10.66.66.2/32,fd42:42:42::2/128
`;

const extractedClearPeerWithAdditionalInformation = {
  title: ``,
  data: ``,
  type: `[Peer]`,
  config: `PublicKey = dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf
PresharedKey = asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf
AllowedIPs = 10.66.66.2/32,fd42:42:42::2/128`
};

const originalInterface = `PrivateKey = afsfsfasfakljfsda;ljfjal;sfjlajsfjasldf
Address = 10.66.66.1/24
Address = fd42:42:42::1/64
ListenPort = 57418
PostUp = iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i wg0 -j ACCEPT
PostUp = ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i eth0 -o wg0 -j ACCEPT
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i wg0 -j ACCEPT
PostDown = ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE`;

const parsedInterface = {
  PrivateKey: 'afsfsfasfakljfsda;ljfjal;sfjlajsfjasldf',
  Address: '10.66.66.1/24,fd42:42:42::1/64',
  ListenPort: '57418',
  PostUp:
    'iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT,iptables -A FORWARD -i wg0 -j ACCEPT,iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE,ip6tables -A FORWARD -i wg0 -j ACCEPT,ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE',
  PostDown:
    'iptables -D FORWARD -i eth0 -o wg0 -j ACCEPT,iptables -D FORWARD -i wg0 -j ACCEPT,iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE,ip6tables -D FORWARD -i wg0 -j ACCEPT,ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE'
};

const originalPeer = `PublicKey = dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf
PresharedKey = asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf
AllowedIPs = 10.66.66.2/32,fd42:42:42::2/128`;

const parsedPeer = {
  PublicKey: 'dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf',
  PresharedKey: 'asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf',
  AllowedIPs: '10.66.66.2/32,fd42:42:42::2/128'
};

export const mockedConfig = `### Do not edit this file manually!
# lastUpdate = 11.04.2022 22:33 (+0)
[Interface]
PrivateKey = afsfsfasfakljfsda;ljfjal;sfjlajsfjasldf
Address = 10.66.66.1/24
Address = fd42:42:42::1/64
ListenPort = 57418
PostUp = iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i wg0 -j ACCEPT
PostUp = ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i eth0 -o wg0 -j ACCEPT
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i wg0 -j ACCEPT
PostDown = ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

### Client NL_PK_Mac
# lastUpdate = 22-10-2022 23:32 (+0)
# firstName = la-la-tru-2
# lastName = last name
# userName = tru-la-la-1
# userId = 23123123123
# fileName = nl2_123456789_1
[Peer]
PublicKey = dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf
PresharedKey = asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf
AllowedIPs = 10.66.66.2/32
AllowedIPs = fd42:42:42::2/128

### Client NL_PK_Phone
# firstName = la-la-tru-4
# userName = tru-la-la-3
[Peer]
PublicKey = dafkjs;fvmn,xcnvioqur0uwer[ujfas=
PresharedKey = asdfiop4iefjkdsafk;hjsiwue
AllowedIPs = 10.66.66.3/32
AllowedIPs = fd42:42:42::3/128

### Client NL_LV_Phone
# firstName = la-la-tru-6
# userName = tru-la-la-5
[Peer]
PublicKey = Yasdfkjsfk;auwioetrhjfds
PresharedKey = asdkfjfiu930wterioghjkfdls;ghjiuoerpwjkl
AllowedIPs = 10.66.66.4/32
AllowedIPs = fd42:42:42::4/128

### Client NL_KS_Win
[Peer]
PublicKey = dsfjhiueorpwtjkghiuopfjaklsgdhioutpwjerklghsdfi
PresharedKey = aklsjdfklasdasfhahshlflasjhfafs
AllowedIPs = 10.66.66.5/32
AllowedIPs = fd42:42:42::5/128

`;

export const parsedConfig: WireguardConfig = {
  interface: {
    config: {
      Address: '10.66.66.1/24,fd42:42:42::1/64',
      ListenPort: '57418',
      PostDown:
        'iptables -D FORWARD -i eth0 -o wg0 -j ACCEPT,iptables -D FORWARD -i wg0 -j ACCEPT,iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE,ip6tables -D FORWARD -i wg0 -j ACCEPT,ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE',
      PostUp:
        'iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT,iptables -A FORWARD -i wg0 -j ACCEPT,iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE,ip6tables -A FORWARD -i wg0 -j ACCEPT,ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE',
      PrivateKey: 'afsfsfasfakljfsda;ljfjal;sfjlajsfjasldf'
    },
    data: {
      lastUpdate: '11.04.2022 22:33 (+0)'
    },
    title: 'Do not edit this file manually!',
    type: '[Interface]'
  },
  peers: [
    {
      config: {
        AllowedIPs: '10.66.66.2/32,fd42:42:42::2/128',
        PresharedKey: 'asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf',
        PublicKey: 'dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf'
      },
      data: {
        firstName: 'la-la-tru-2',
        lastName: 'last name',
        userName: 'tru-la-la-1',
        userId: '23123123123',
        lastUpdate: '22-10-2022 23:32 (+0)',
        fileName: 'nl2_123456789_1'
      },
      title: 'Client NL_PK_Mac',
      type: '[Peer]'
    },
    {
      config: {
        AllowedIPs: '10.66.66.3/32,fd42:42:42::3/128',
        PresharedKey: 'asdfiop4iefjkdsafk;hjsiwue',
        PublicKey: 'dafkjs;fvmn,xcnvioqur0uwer[ujfas='
      },
      data: {
        firstName: 'la-la-tru-4',
        userName: 'tru-la-la-3'
      },
      title: 'Client NL_PK_Phone',
      type: '[Peer]'
    },
    {
      config: {
        AllowedIPs: '10.66.66.4/32,fd42:42:42::4/128',
        PresharedKey: 'asdkfjfiu930wterioghjkfdls;ghjiuoerpwjkl',
        PublicKey: 'Yasdfkjsfk;auwioetrhjfds'
      },
      data: {
        firstName: 'la-la-tru-6',
        userName: 'tru-la-la-5'
      },
      title: 'Client NL_LV_Phone',
      type: '[Peer]'
    },
    {
      config: {
        AllowedIPs: '10.66.66.5/32,fd42:42:42::5/128',
        PresharedKey: 'aklsjdfklasdasfhahshlflasjhfafs',
        PublicKey: 'dsfjhiueorpwtjkghiuopfjaklsgdhioutpwjerklghsdfi'
      },
      data: {},
      title: 'Client NL_KS_Win',
      type: '[Peer]'
    }
  ]
};

export const parsedConfigWithoutThird: WireguardConfig = {
  interface: {
    config: {
      Address: '10.66.66.1/24,fd42:42:42::1/64',
      ListenPort: '57418',
      PostDown:
        'iptables -D FORWARD -i eth0 -o wg0 -j ACCEPT,iptables -D FORWARD -i wg0 -j ACCEPT,iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE,ip6tables -D FORWARD -i wg0 -j ACCEPT,ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE',
      PostUp:
        'iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT,iptables -A FORWARD -i wg0 -j ACCEPT,iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE,ip6tables -A FORWARD -i wg0 -j ACCEPT,ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE',
      PrivateKey: 'afsfsfasfakljfsda;ljfjal;sfjlajsfjasldf'
    },
    data: {
      lastUpdate: '11.04.2022 22:33 (+0)'
    },
    title: 'Do not edit this file manually!',
    type: '[Interface]'
  },
  peers: [
    {
      config: {
        AllowedIPs: '10.66.66.2/32,fd42:42:42::2/128',
        PresharedKey: 'asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf',
        PublicKey: 'dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf'
      },
      data: {
        firstName: 'la-la-tru-2',
        lastName: 'last name',
        userName: 'tru-la-la-1',
        userId: '222',
        lastUpdate: '22-10-2022 23:32 (+0)',
        fileName: 'nl2_123456789_1'
      },
      title: 'Client NL_PK_Mac',
      type: '[Peer]'
    },
    {
      config: {
        AllowedIPs: '10.66.66.4/32,fd42:42:42::4/128',
        PresharedKey: 'asdkfjfiu930wterioghjkfdls;ghjiuoerpwjkl',
        PublicKey: 'Yasdfkjsfk;auwioetrhjfds'
      },
      data: {
        firstName: 'la-la-tru-6',
        userName: 'tru-la-la-5',
        userId: '111'
      },
      title: 'Client NL_LV_Phone',
      type: '[Peer]'
    },
    {
      config: {
        AllowedIPs: '10.66.66.5/32,fd42:42:42::5/128',
        PresharedKey: 'aklsjdfklasdasfhahshlflasjhfafs',
        PublicKey: 'dsfjhiueorpwtjkghiuopfjaklsgdhioutpwjerklghsdfi'
      },
      data: {
        userId: '222'
      },
      title: 'Client NL_KS_Win',
      type: '[Peer]'
    }
  ]
};

const parsedInterfaceConfig = {
  config: {
    Address: '10.66.66.1/24,fd42:42:42::1/64',
    ListenPort: '57418',
    PostDown:
      'iptables -D FORWARD -i eth0 -o wg0 -j ACCEPT,iptables -D FORWARD -i wg0 -j ACCEPT,iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE,ip6tables -D FORWARD -i wg0 -j ACCEPT,ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE',
    PostUp:
      'iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT,iptables -A FORWARD -i wg0 -j ACCEPT,iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE,ip6tables -A FORWARD -i wg0 -j ACCEPT,ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE',
    PrivateKey: 'afsfsfasfakljfsda;ljfjal;sfjlajsfjasldf'
  },
  data: {
    lastUpdate: '11.04.2022 22:33 (+0)'
  },
  title: 'Do not edit this file manually!',
  type: '[Interface]'
};

const serializedInterfaceConfig = `### Do not edit this file manually!
# lastUpdate = 11.04.2022 22:33 (+0)
[Interface]
PrivateKey = afsfsfasfakljfsda;ljfjal;sfjlajsfjasldf
Address = 10.66.66.1/24
Address = fd42:42:42::1/64
ListenPort = 57418
PostUp = iptables -A FORWARD -i eth0 -o wg0 -j ACCEPT
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT
PostUp = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostUp = ip6tables -A FORWARD -i wg0 -j ACCEPT
PostUp = ip6tables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i eth0 -o wg0 -j ACCEPT
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE
PostDown = ip6tables -D FORWARD -i wg0 -j ACCEPT
PostDown = ip6tables -t nat -D POSTROUTING -o eth0 -j MASQUERADE`;

const parsedPeerConfig = {
  config: {
    AllowedIPs: '10.66.66.2/32,fd42:42:42::2/128',
    PresharedKey: 'asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf',
    PublicKey: 'dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf'
  },
  data: {
    firstName: 'la-la-tru-2',
    lastName: 'last name',
    userName: 'tru-la-la-1',
    userId: '23123123123',
    lastUpdate: '22-10-2022 23:32 (+0)',
    fileName: 'nl2_123456789_1'
  },
  title: 'Client NL_PK_Mac',
  type: '[Peer]'
};

const serializedPeerConfig = `### Client NL_PK_Mac
# lastUpdate = 22-10-2022 23:32 (+0)
# firstName = la-la-tru-2
# lastName = last name
# userName = tru-la-la-1
# userId = 23123123123
# fileName = nl2_123456789_1
[Peer]
PublicKey = dsfjsfjaslkdjfoajsdf jasfjlasjdfl;j asldjf lajsdf
PresharedKey = asfjas;fjalksjdfioeuqrpoiuweioruiojdfsalkf
AllowedIPs = 10.66.66.2/32
AllowedIPs = fd42:42:42::2/128`;

export const serializedClientConfig = `[Interface]
PrivateKey = aiupououyuiyiuyom,nm,nbkjjkhgklg
Address = 10.66.66.24/32
Address = fd42:42:42::24/128
DNS = 1.1.1.1
DNS = 8.8.8.8

[Peer]
PublicKey = nmbvcnmbvnmm,bvnm,bvghjbnmvm
PresharedKey = gkghgjhgjkgkjhgkgkjghkjgkjgjkgjkgh
Endpoint = 1.1.1.1:76542
PersistentKeepalive = 23
AllowedIPs = 0.0.0.0/0
AllowedIPs = ::/0`;

export const parsedClientConfig: ClientConfig = {
  interface: {
    type: `[Interface]`,
    PrivateKey: `aiupououyuiyiuyom,nm,nbkjjkhgklg`,
    Address: `10.66.66.24/32,fd42:42:42::24/128`,
    DNS: ['1.1.1.1', '8.8.8.8']
  },
  peer: {
    type: `[Peer]`,
    PublicKey: `nmbvcnmbvnmm,bvnm,bvghjbnmvm`,
    PresharedKey: `gkghgjhgjkgkjhgkgkjghkjgkjgjkgjkgh`,
    Endpoint: `1.1.1.1:76542`,
    PersistentKeepalive: '23',
    AllowedIPs: `0.0.0.0/0,::/0`
  }
};
