const PIXELES_FUENTE_GRANDE = 30,
	PIXELES_FUENTE_NORMAL = 20,
	PIXELES_GRUESO_LINEA = 2,
	SEPARACION_VERTICAL = 5,
	PREFIJO_IDENTIFICADORES = "uml_";
new Vue({
	el: "#app",
	data: () => ({
		idEditado: "",
		mostrarGuardados: false,
		diagramas: [],
		diagrama: {
			titulo: "",
			propiedades: "",
			metodos: "",
		}
	}),
	mounted() {
		this.refrescarImagen();
		this.refrescarGuardados();
	},
	methods: {
		uuid() {
			return PREFIJO_IDENTIFICADORES + (function b(a) { return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b) }());
		},
		descargar() {
			if (!this.diagrama.titulo) return;
			let enlace = document.createElement('a');
			enlace.download = `${this.diagrama.titulo}.png`;
			enlace.href = this.$refs.canvas.toDataURL();
			enlace.click();
		},
		refrescarGuardados() {
			this.diagramas = Object.keys(localStorage)
				.filter(clave => clave.startsWith(PREFIJO_IDENTIFICADORES))
				.map(clave => ({
					id: clave,
					titulo: JSON.parse(localStorage.getItem(clave)).titulo
				}));
		},
		cargar(id) {
			let posibleDiagrama = localStorage.getItem(id);
			if (posibleDiagrama) {
				this.diagrama = JSON.parse(posibleDiagrama);
				this.idEditado = id;
			}
			this.refrescarImagen();
		},
		guardar() {
			let id = this.idEditado || this.uuid();
			localStorage[id] = JSON.stringify(this.diagrama);
			this.idEditado = id;
			this.refrescarGuardados();
		},
		nuevo() {
			this.idEditado = null;
			this.diagrama.titulo = "";
			this.diagrama.propiedades = "";
			this.diagrama.metodos = "";
		},
		eliminar(id) {
			if (!confirm("¿Estás seguro?")) return;
			localStorage.removeItem(id);
			this.refrescarGuardados();
		},
		refrescarImagen() {
			let propiedades = this.diagrama.propiedades.split("\n"), metodos = this.diagrama.metodos.split("\n");
			if (!this.diagrama.titulo || !propiedades.length || !metodos.length) return;
			this.generarImagen(this.diagrama.titulo, propiedades, metodos);
		},
		generarImagen(titulo, propiedades, metodos) {
			let canvas = this.$refs.canvas;
			// Saber cuál es la palabra más larga
			let masLarga = "";
			propiedades.forEach(propiedad => {
				if (propiedad.length >= masLarga.length) {
					masLarga = propiedad;
				}
			});

			metodos.forEach(metodo => {
				if (metodo.length >= masLarga.length) {
					masLarga = metodo;
				}
			});

			let longitudDeTitulo = titulo.length * PIXELES_FUENTE_GRANDE;
			let longitudMayor = masLarga.length * PIXELES_FUENTE_NORMAL

			let altura = (
				(metodos.length + propiedades.length) * PIXELES_FUENTE_NORMAL)
				+ PIXELES_FUENTE_GRANDE // Lo que ocupa el título
				+ (SEPARACION_VERTICAL * 2) // Separamos 2 veces
				+ (PIXELES_GRUESO_LINEA * 2)// Y dibujamos 2 líneas
				+ PIXELES_FUENTE_NORMAL + SEPARACION_VERTICAL // Lo agregué porque ni así calculaba el ancho :v
				,
				anchura = longitudDeTitulo > longitudMayor ? longitudDeTitulo : longitudMayor;
			canvas.width = anchura;
			canvas.height = altura;

			let contexto = canvas.getContext("2d");
			// Primero los bordes
			contexto.lineWidth = PIXELES_GRUESO_LINEA * 2;
			contexto.strokeRect(0, 0, anchura, altura);

			// Le título ( sí, dije le)
			contexto.font = `${PIXELES_FUENTE_GRANDE}px Century Gothic`;

			let x = 10, y = PIXELES_FUENTE_GRANDE;
			// A ver.. comencemos poniendo el título
			contexto.fillText(titulo, x, y);

			// La línea bajo el título
			y += SEPARACION_VERTICAL + PIXELES_GRUESO_LINEA;
			contexto.lineWidth = PIXELES_GRUESO_LINEA;
			contexto.moveTo(0, y);
			contexto.lineTo(anchura, y);

			// Poner propiedades
			contexto.font = `${PIXELES_FUENTE_NORMAL}px Century Gothic`;

			propiedades.forEach(propiedad => {
				y += PIXELES_FUENTE_NORMAL;
				contexto.moveTo(0, y);
				contexto.fillText(propiedad, x, y);
			});

			// La línea bajo las propiedades
			contexto.lineWidth = PIXELES_GRUESO_LINEA;
			y += SEPARACION_VERTICAL + PIXELES_GRUESO_LINEA;
			contexto.moveTo(0, y);
			contexto.lineTo(anchura, y);

			// Poner métodos
			contexto.font = `${PIXELES_FUENTE_NORMAL}px Century Gothic`;

			metodos.forEach(metodo => {
				y += PIXELES_FUENTE_NORMAL;
				contexto.moveTo(0, y);
				contexto.fillText(metodo, x, y);
			});

			contexto.stroke();
		}
	}
});