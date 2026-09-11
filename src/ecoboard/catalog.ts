export type CatalogReference = {
    id: string; title: string; group: string; pages: number[];
    codes: string[]; historicalCodes?: string[]; notes: string[];
  };
  export const catalogReferences: CatalogReference[] = [
    {id:'criterios',title:'Critérios e regras gerais',group:'Critérios',pages:[2,3],codes:[],notes:['Os percentuais não possuem método de medição suficientemente definido para automação.','Ponteira não equivale a conector macho. Preservar as exceções da fonte.','Perfis metálicos: a fonte cita abaixo de 1 mm e acima de 2 mm; não completar os limites por suposição.']},
    {id:'ceramicos',title:'Processadores cerâmicos',group:'Componentes',pages:[4],codes:['HIG0010','HIG0011','HIG0012','HIG0018'],notes:['As letras e códigos são do catálogo; não equivalem automaticamente às categorias do comprador.']},
    {id:'plasticos',title:'Processadores plásticos',group:'Componentes',pages:[5],codes:['HIG0005','HIG0019','HIG0020'],notes:[]},
    {id:'memorias',title:'Memórias e processador slot',group:'Componentes',pages:[6],codes:['HIG0007','HIG0008','HIG0017','SCI043'],notes:['A página contém códigos de memória de padrões distintos. Preservamos as ocorrências originais.']},
    {id:'douradas',title:'Placas douradas',group:'Placas',pages:[7],codes:['HIG0004','HIG0015'],notes:['A descrição de Dourada B cita trilha dourada nos dois lados. Uma só face não comprova esse critério.']},
    {id:'telefonia-completa',title:'Telefonia completa',group:'Telefonia',pages:[8,9],codes:['HIG0030'],historicalCodes:['SCT032'],notes:['Conferir os critérios combinados e as substituições por processador cerâmico na tabela original.']},
    {id:'telefonia-ponteira',title:'Telefonia com ponteira',group:'Telefonia',pages:[10,11,12,13],codes:['PVE0018'],historicalCodes:['SCT030'],notes:['Não converter automaticamente para Ponteira A ou B da EcoBoard.']},
    {id:'telefonia-sem',title:'Telefonia sem ponteira',group:'Telefonia',pages:[14,15,16],codes:['PVE0019'],historicalCodes:['SCT031'],notes:[]},
    {id:'celulares',title:'Placas de celular com e sem componentes',group:'Celular',pages:[17],codes:['HIG0001','PVE0007','CEL0001','CEL0002'],historicalCodes:['SCI023','SCI013'],notes:['Parte superior: placas. Parte inferior: aparelhos, com códigos próprios.','Não confundir uma face pouco povoada com uma placa inteira sem componentes. Blindagens ocultam componentes.','HIG0001: com componentes. PVE0007: sem componentes.']},
    {id:'backplane',title:'Placa conector — Backplane',group:'Conectores',pages:[18],codes:['HIG0023'],notes:['A tabela utiliza a denominação Placa Tapete.']},
    {id:'conector',title:'Placa conector normal',group:'Conectores',pages:[19],codes:['PVE0002'],notes:[]},
    {id:'leve-com',title:'Placa leve com ponteira',group:'Placas',pages:[20,21,22],codes:['PVE0003'],historicalCodes:['SCI006'],notes:['A fonte cita 50%–75% de componentes e substituição de ponteira por processador cerâmico.','O nome Placa Leve não garante equivalência com a classificação EcoBoard.']},
    {id:'leve-sem',title:'Placa leve sem ponteira',group:'Placas',pages:[23,24],codes:['PVE0004'],historicalCodes:['SCI007'],notes:['A fonte cita 50%–75% de componentes; não converter em percentual de peso ou área sem validação.']},
    {id:'mae-verde',title:'Placa-mãe verde, soquete pequeno',group:'Computadores',pages:[25],codes:['PMC004','PMC004-1'],notes:['Grafia original preservada. Comparação com PMC0004-1 ainda pendente.']},
    {id:'mae-colorida',title:'Placa-mãe colorida',group:'Computadores',pages:[26],codes:['PMC0003','PMC0002'],notes:['A fonte diferencia soquete grande e pequeno; cores citadas: vermelha, azul e roxa.']},
    {id:'notebook',title:'Placa-mãe de notebook',group:'Computadores',pages:[27],codes:['PVE0013'],historicalCodes:['SCI074'],notes:['Não inferir graduação Notebook A/B/C somente pela origem.']},
    {id:'mae-regular',title:'Placa-mãe regular, soquete pequeno',group:'Computadores',pages:[28],codes:['PMC0004-1'],notes:['Não normalizar silenciosamente para PMC004-1.']},
    {id:'mae-pequena',title:'Placa-mãe pequena — 01 chipset',group:'Computadores',pages:[29],codes:['PVE0015'],notes:[]},
    {id:'intermediaria',title:'Placa intermediária (DVD)',group:'Placas',pages:[30],codes:['PVE0010'],historicalCodes:['SCI026'],notes:['Retirar as conexões não muda a classificação segundo a fonte.','Tabela: 25%–50% de componentes e 25%–50% de itens pesados.','A página inclui uma fotografia de lote. Não atribuir todos os elementos do lote a uma única placa.']},
    {id:'pesada-com',title:'Placa pesada com ponteira',group:'Placas',pages:[31],codes:['PPE0002'],notes:['A fonte registra <25% de componentes e 50% de itens pesados. Não alterar os sinais.']},
    {id:'pesada-sem',title:'Placa pesada sem ponteira',group:'Placas',pages:[32],codes:['PPE0003'],notes:['A fonte registra 25% de componentes, sem sinal de desigualdade, e 50% de itens pesados.']},
    {id:'lisa',title:'Placa lisa com ponteira',group:'Placas',pages:[33],codes:['PPE0001'],notes:[]},
    {id:'aluminio',title:'Placa leve sem ponteira de alumínio',group:'Placas',pages:[34],codes:['PVE0004'],notes:['Mesmo código também aparece em outros exemplos; consultar a descrição e a foto.']},
    {id:'marrom',title:'Placa marrom',group:'Placas',pages:[35],codes:['PTV0001'],notes:['A fonte descreve fenolite e fragilidade. Não é necessário quebrar a placa para consultar esta referência.']},
    {id:'hd-completo',title:'HD completo e HD de notebook',group:'Equipamentos',pages:[36],codes:['HDI0001','HDI0002'],notes:['Equipamentos completos; não confundir com o código de placa de HD.']},
    {id:'hd',title:'Placa de HD',group:'Computadores',pages:[37],codes:['PVE0016'],historicalCodes:['SCR045'],notes:['As quatro fotos não estão confirmadas como pares frente e verso.','Correspondência candidata com PLACA_HD; validação comercial pelo comprador pendente.']},
    {id:'conectores-soltos',title:'Conectores de placa e plug de dados',group:'Conectores',pages:[38],codes:['PVE0008','SCR0015'],notes:['Itens separados da placa possuem códigos próprios.']},
    {id:'drives',title:'Drives de alumínio e ferro',group:'Equipamentos',pages:[39],codes:['SCR0008','SCR0005','SCR0007','SCR0006'],notes:['Referências de equipamentos; não equivalem à PCB controladora de drive.']},
    {id:'fontes',title:'Fonte e material para desmontar',group:'Equipamentos',pages:[40],codes:['SCR0004','SCR0003'],notes:[]},
    {id:'cooler',title:'Cooler e CD-ROM',group:'Equipamentos',pages:[41],codes:['SCR0001','SCR0020'],notes:[]},
    {id:'ci',title:'Circuitos integrados cerâmicos e plásticos',group:'Componentes',pages:[42],codes:['HIG0003','HIG0002'],notes:['Código comercial do CI não é a marcação gravada no componente.']},
  ];
  export function normalizeCatalogText(value: string) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  export function searchReferences(query: string, group = '') {
    const terms = normalizeCatalogText(query).split(/\s+/).filter(Boolean);
    return catalogReferences.filter(item => {
      const text = normalizeCatalogText([item.title, item.group, ...item.codes, ...(item.historicalCodes || []), ...item.notes].join(' '));
      return (!group || item.group === group) && terms.every(term => text.includes(term));
    });
  }
  