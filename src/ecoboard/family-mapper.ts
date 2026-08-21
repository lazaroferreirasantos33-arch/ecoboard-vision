import {
    EcoBoardBoardFamily,
  } from './classification-matrix';
  
  function normalizeText(
    value?: string,
  ): string {
    return (value ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
  
  export function mapBoardTypeToFamily(
    boardType?: string,
    probableName?: string,
    equipment?: string,
  ): EcoBoardBoardFamily | null {
    const text = normalizeText(
      [
        boardType,
        probableName,
        equipment,
      ]
        .filter(Boolean)
        .join(' '),
    );
  
    if (!text) {
      return null;
    }
  
    if (
      text.includes('placa de video') ||
      text.includes('placa grafica') ||
      text.includes('gpu') ||
      text.includes('graphics card') ||
      text.includes('video card')
    ) {
      return 'GPU';
    }
  
    if (
      text.includes('servidor') ||
      text.includes('server') ||
      text.includes('server board') ||
      text.includes('server motherboard')
    ) {
      return 'SERVER';
    }
  
    if (
      text.includes('line card') ||
      text.includes('carrier grade') ||
      text.includes('carrier-grade') ||
      text.includes('telecom board') ||
      text.includes('telecommunications') ||
      text.includes('switch enterprise') ||
      text.includes('enterprise switch') ||
      text.includes('core switch') ||
      text.includes('datacenter switch') ||
      text.includes('data center switch') ||
      text.includes('network processor board')
    ) {
      return 'TELECOM_ENTERPRISE';
    }
  
    if (
      text.includes('roteador') ||
      text.includes('router') ||
      text.includes('access point') ||
      text.includes('wireless router') ||
      text.includes('wireless access point') ||
      text.includes('switch domestico') ||
      text.includes('home router') ||
      text.includes('soho') ||
      text.includes('wi-fi router') ||
      text.includes('wifi router')
    ) {
      return 'CONSUMER_NETWORKING';
    }
  
    if (
      text.includes('notebook') ||
      text.includes('laptop') ||
      text.includes('placa mae notebook') ||
      text.includes('motherboard notebook') ||
      text.includes('laptop motherboard')
    ) {
      return 'LAPTOP';
    }
  
    if (
      text.includes('motherboard') ||
      text.includes('placa mae') ||
      text.includes('desktop motherboard') ||
      text.includes('mainboard')
    ) {
      return 'DESKTOP_MOTHERBOARD';
    }
  
    if (
      text.includes('tv') ||
      text.includes('monitor') ||
      text.includes('display') ||
      text.includes('t-con') ||
      text.includes('main board tv') ||
      text.includes('placa principal tv')
    ) {
      return 'TV_DISPLAY';
    }
  
    if (
      text.includes('fonte') ||
      text.includes('power supply') ||
      text.includes('power board') ||
      text.includes('psu') ||
      text.includes('placa de potencia') ||
      text.includes('power')
    ) {
      return 'POWER';
    }
  
    if (
      text.includes('eletrodomestico') ||
      text.includes('appliance') ||
      text.includes('maquina de lavar') ||
      text.includes('geladeira') ||
      text.includes('refrigerador') ||
      text.includes('micro-ondas') ||
      text.includes('microwave') ||
      text.includes('ar condicionado') ||
      text.includes('air conditioner')
    ) {
      return 'APPLIANCE';
    }
  
    return null;
  }