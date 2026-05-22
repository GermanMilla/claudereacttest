export const svPalette = {
  flagBlue: '#1558d6',
  deepBlue: '#0b2f66',
  torogozTeal: '#1f9bb4',
  mangoGreen: '#4d6621',
  mangoGold: '#f2a91b',
  pupusaCorn: '#f7e2a1',
  curtidoRed: '#d94a32',
  paper: '#fffaf0',
  paperWarm: '#fff6e4',
  paperCool: '#f4fbff',
  ink: '#172033',
  mutedInk: '#39445a',
  borderBlue: 'rgba(21, 88, 214, 0.18)',
  izalcoBlack: 'rgba(20, 31, 43,1)'
}

export const svGradients = {
  page: `linear-gradient(135deg, ${svPalette.paper} 0%, ${svPalette.paperCool} 48%, ${svPalette.paperWarm} 100%)`,
  flagHeader: `linear-gradient(90deg, ${svPalette.izalcoBlack} 0%, ${svPalette.flagBlue} 60%, ${svPalette.torogozTeal} 100%)`,
  //mangoGlow: `radial-gradient(circle at 14% 12%, rgba(242, 169, 27, 0.34), transparent 24%), linear-gradient(135deg, ${svPalette.paper} 0%, ${svPalette.paperCool} 48%, ${svPalette.paperWarm} 100%)`
}
