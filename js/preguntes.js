/* Banc de preguntes: per a cada lletra, una o més pistes.
   La primera resposta és la que es mostra; la resta són variants acceptades. */
const LETTERS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Z",
];

const CLUE_BANK = {
  A: [
    { letter: "A", type: "starts", clue: "Capital de la província més meridional de la Comunitat Valenciana.", answers: ["Alacant", "Alicante"] },
    { letter: "A", type: "starts", clue: "Serra més alta de la província d'Alacant, amb el cim a 1.558 metres.", answers: ["Aitana", "Serra d'Aitana"] },
  ],
  B: [
    { letter: "B", type: "starts", clue: "Ciutat turística de la Marina Baixa famosa pels seus gratacels.", answers: ["Benidorm"] },
    { letter: "B", type: "starts", clue: "Municipi de la Plana Alta conegut pel seu festival internacional de música.", answers: ["Benicàssim", "Benicasim"] },
  ],
  C: [
    { letter: "C", type: "starts", clue: "Capital de la província més septentrional de la Comunitat Valenciana.", answers: ["Castelló", "Castelló de la Plana", "Castellón"] },
    { letter: "C", type: "starts", clue: "Municipi de la Marina Alta on s'alça el Penyal d'Ifac.", answers: ["Calp", "Calpe"] },
    { letter: "C", type: "starts", clue: "Municipi de la Ribera Baixa on desemboca el Xúquer, amb far i castell.", answers: ["Cullera"] },
  ],
  D: [
    { letter: "D", type: "starts", clue: "Capital de la Marina Alta, amb un port d'on ixen vaixells cap a les Balears.", answers: ["Dénia", "Denia"] },
  ],
  E: [
    { letter: "E", type: "starts", clue: "Ciutat del Baix Vinalopó coneguda pel seu palmerar, Patrimoni de la Humanitat.", answers: ["Elx", "Elche"] },
    { letter: "E", type: "starts", clue: "Ciutat del Vinalopó Mitjà coneguda per la indústria del calçat.", answers: ["Elda"] },
  ],
  F: [
    { letter: "F", type: "starts", clue: "Parc natural entre Alcoi i Ibi, amb un bosc de carrasques i teixos.", answers: ["Font Roja", "La Font Roja", "Carrascar de la Font Roja"] },
  ],
  G: [
    { letter: "G", type: "starts", clue: "Capital de la Safor, antiga seu del ducat dels Borja.", answers: ["Gandia", "Gandía"] },
    { letter: "G", type: "starts", clue: "Poble de la Marina Baixa amb un castell enfilat damunt d'una roca i un embassament.", answers: ["Guadalest", "El Castell de Guadalest"] },
  ],
  H: [
    { letter: "H", type: "starts", clue: "Comarca agrícola que envolta la ciutat de València, terra de xufa i hortalisses.", answers: ["Horta", "L'Horta", "Huerta"] },
  ],
  I: [
    { letter: "I", type: "starts", clue: "Municipi de l'Alcoià conegut com la vila de la joguina.", answers: ["Ibi"] },
    { letter: "I", type: "starts", clue: "Penyal emblemàtic de Calp que s'endinsa en la mar.", answers: ["Ifac", "Ifach", "Penyal d'Ifac"] },
  ],
  J: [
    { letter: "J", type: "contains", clue: "Municipi del Baix Segura conegut per les seues coves habitades i el pont de Carles III.", answers: ["Rojales"] },
  ],
  L: [
    { letter: "L", type: "starts", clue: "Ciutat del Camp de Túria coneguda com la ciutat de la música.", answers: ["Llíria", "Liria"] },
  ],
  M: [
    { letter: "M", type: "starts", clue: "Capital dels Ports, ciutat emmurallada coronada per un castell.", answers: ["Morella"] },
    { letter: "M", type: "starts", clue: "Muntanya que s'alça entre Dénia i Xàbia.", answers: ["Montgó", "Montgo"] },
    { letter: "M", type: "starts", clue: "Nom compartit per dues comarques del nord de Castelló, l'Alt i el Baix.", answers: ["Maestrat", "Maestrazgo"] },
  ],
  N: [
    { letter: "N", type: "starts", clue: "Ciutat del Vinalopó Mitjà coneguda pel marbre i el santuari de la Magdalena.", answers: ["Novelda"] },
  ],
  O: [
    { letter: "O", type: "starts", clue: "Capital del Baix Segura, amb catedral i un gran palmerar.", answers: ["Oriola", "Orihuela"] },
    { letter: "O", type: "starts", clue: "Capital de la Vall d'Albaida.", answers: ["Ontinyent", "Onteniente"] },
  ],
  P: [
    { letter: "P", type: "starts", clue: "Ciutat del Baix Maestrat amb el castell del Papa Luna damunt la mar.", answers: ["Peníscola", "Peñíscola"] },
    { letter: "P", type: "starts", clue: "Cim més alt de la província de Castelló, amb 1.813 metres.", answers: ["Penyagolosa", "Peñagolosa"] },
  ],
  Q: [
    { letter: "Q", type: "contains", clue: "Ciutat de l'interior de València, terra de vins i caves, amb un barri antic anomenat la Vila.", answers: ["Requena"] },
    { letter: "Q", type: "contains", clue: "Riu que naix a Conca i desemboca a Cullera.", answers: ["Xúquer", "Júcar"] },
  ],
  R: [
    { letter: "R", type: "starts", clue: "Nom de dues comarques, l'Alta i la Baixa, regades pel Xúquer.", answers: ["Ribera", "La Ribera"] },
  ],
  S: [
    { letter: "S", type: "starts", clue: "Ciutat del Camp de Morvedre amb un teatre romà i un castell.", answers: ["Sagunt", "Sagunto"] },
    { letter: "S", type: "starts", clue: "Riu que desemboca a Guardamar, al sud de tot del territori.", answers: ["Segura"] },
  ],
  T: [
    { letter: "T", type: "starts", clue: "Única illa habitada de la Comunitat Valenciana, davant de Santa Pola.", answers: ["Tabarca", "Illa de Tabarca", "Nova Tabarca"] },
    { letter: "T", type: "starts", clue: "Riu que travessava València i el vell llit del qual és ara un gran jardí.", answers: ["Túria", "Turia"] },
  ],
  U: [
    { letter: "U", type: "starts", clue: "Municipi que, junt amb Requena, dona nom a una comarca vinícola.", answers: ["Utiel"] },
    { letter: "U", type: "contains", clue: "Municipi de la Foia de Bunyol on se celebra la Tomatina.", answers: ["Bunyol", "Buñol"] },
  ],
  V: [
    { letter: "V", type: "starts", clue: "Ciutat més septentrional de la costa valenciana, famosa pels llagostins.", answers: ["Vinaròs", "Vinaroz"] },
    { letter: "V", type: "starts", clue: "Ciutat de la Plana Baixa coneguda pel seu equip de futbol, el Submarí Groc.", answers: ["Vila-real", "Villarreal"] },
  ],
  X: [
    { letter: "X", type: "starts", clue: "Capital de la Costera, bressol dels papes Borja, amb un castell sobre la ciutat.", answers: ["Xàtiva", "Játiva"] },
    { letter: "X", type: "starts", clue: "Municipi de l'Alacantí famós arreu pel seu torró.", answers: ["Xixona", "Jijona"] },
  ],
  Z: [
    { letter: "Z", type: "contains", clue: "Capital de la Ribera Alta, antigament envoltada pel Xúquer.", answers: ["Alzira", "Alcira"] },
  ],
};

