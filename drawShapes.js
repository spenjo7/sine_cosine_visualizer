//----------------////---- Calculations ----////----------------//

const trigLookup = Array.from({ length: 360 }, ( _ , i ) =>{
	const theta = i * Math.PI / 180 // multiply by degrees to get radians
	const sin = Math.sin(theta)
	const cos = Math.cos(theta)
	return ({ sin, cos, degrees: i })
})

// console.info('Trig Lookup Tables loaded')

const calcPaddedBoundries = ({centX, centY, radius, padding }) => {
	const buffer = radius * padding

	const rightX = centX + radius
	const rightXb = centX + buffer
	
	const leftX = centX - radius
	const leftXb = centX - buffer
	
	const topY = centY - radius
	const topYb = centY - buffer
	
	const bottomY = centY + radius
	const bottomYb = centY + buffer
	
	// probably don't need to return buffer, but why not // 
	return {
		buffer, 
		rightX,			rightXb,
		leftX,			leftXb,
		topY,			topYb,
		bottomY,			bottomYb
	}
}


//----------------////---- DRAWING ----////----------------//

const drawLine = (ctx, opts = {}) => {
	const { 
		originX, 
		originY,
		endX,
		endY,
		color
	} = opts 

	ctx.strokeStyle = color? color: "white"
	ctx.beginPath()
	ctx.moveTo(originX, originY)
	ctx.lineTo(endX, endY)
	ctx.stroke()
}


const drawGridLines = (ctx, opts = {}) => { // just the decorative background
	const {width, height} = ctx.canvas
			// Bring in optional values // 
	const {originX, originY, lineWidth, color } = opts
		
	const x = originX?? width/2
	const y = originY?? height/2
	
	// Trace Path before Drawing // 
	ctx.beginPath()
	ctx.moveTo(x, 0)	// Vertical Guide Line //
	ctx.lineTo(x, height)
	ctx.moveTo(0, y)	// Horizontal Guide Line
	ctx.lineTo(width, y)

	// Set some styles //
	ctx.strokeStyle = color?? 'grey'
	ctx.lineWidth = lineWidth?? 1

		// Draw the Shape //
	ctx.stroke() // No Fill option; only Stroke
}

const drawCircle = (ctx, opts = {}) => {
	// Origin from center; based on ctx.canvas width/height  //
	const {width, height} = ctx.canvas

		// Bring in optional values // 
	const {originX, originY, radius, lineWidth, color, fillStyle } = opts
	const _x = originX?? width / 2
	const y = originY?? height /2 

	ctx.beginPath()
	ctx.arc(_x, y, radius, 0, 360) 	// last two args are the start and end angles
	ctx.closePath() // close Path when done Tracing //
	
	// Set some Styles //
	ctx.lineWidth = lineWidth?? 1
	ctx.strokeStyle = color?? 'grey'
		
		// Draw the Shape -- Now we do have fill as an option //
	if(color || !fillStyle){ // stroke is semi-optional
		ctx.stroke()
	}
	if(fillStyle){
		ctx.fillStyle = fillStyle // can be unused
		ctx.fill()
	}
}

const drawRadii = (ctx, opts = {}) => { // just the decorative background
	const {width, height} = ctx.canvas
			// Bring in optional values // 
	const { radius, lineWidth, color, padding } = opts
		

	const pad = padding * radius // padding is a decimal multiplier 
	const centX = width/2
	const centY = height/2
	const radians = radius * (Math.PI / 2)

	const quadsX = Math.ceil((centX - pad) / ( radians )) 
	const pointsX = Array.from({ length: quadsX }, (_, i) => radians * (i+1))
	pointsX.forEach((x,i) => {
		const xP = centX + pad + x
		const xN = centX - pad - x	
		const font = `${width/radius}px serif`
		const txt =	 `${(i+1)/2}π`   

		ctx.beginPath()
		ctx.moveTo( xP, centY + radius )
		ctx.lineTo( xP, centY - radius )
		ctx.stroke()

		ctx.font = font
		ctx.fillText(txt, xP - (radius/2), i%2? centY + pad +20 : centY - pad)

		ctx.beginPath()
		ctx.moveTo( xN, centY + radius )
		ctx.lineTo( xN, centY - radius )
		ctx.stroke()

		ctx.font = font
		ctx.fillText(txt, xN - (radius/2), i%2? centY + pad +20 : centY - pad)
	})
}


const drawTriangle = (ctx, opts ={}) => {  // hypetenus and fill
	// Origin from center; based on ctx.canvas width/height  //
	const {width, height} = ctx.canvas
	const originX = width/2
	const originY = height/2

		// Bring in optional values // 
	const {X, Y, lineWidth, color, fillStyle } = opts
		
	const x = originX + X // X and Y are optional offsets // 
	const y = originY + Y // ... apply if applicable
	
	
	// Trace path before Drawing // 
	ctx.beginPath()
	ctx.moveTo(originX, originY) // actual Origin
	ctx.lineTo(x,  y) // hypotenus 	
	ctx.lineTo(originX,  y)	// opposite
	ctx.lineTo(originX,  originY) // back to actual Origin?
	ctx.closePath() // close Path when done Tracing //
	
		// Set some styles //
	ctx.strokeStyle = color?? 'grey'
	ctx.lineWidth = lineWidth?? 1

		// Draw the Shape //
	if(color || !fillStyle){
		ctx.stroke()
	}
	if(fillStyle){
		ctx.fillStyle = fillStyle
		ctx.fill()
	}
}

const drawBoundingSquare = ( ctx , linePoints, opts = {}) => {
	// break this down into draw line segment? // 
	const {
		buffer, 
		rightX,			rightXb,
		leftX,			leftXb,
		topY,			topYb,
		bottomY,			bottomYb
	} = linePoints 
	
		// Trace Path before Drawing // 
	ctx.beginPath()

	// use the "b" versions on the main axis
	ctx.moveTo(rightXb, topY) // right vertical top
	ctx.lineTo(rightXb,  bottomY) // right vertical bottom	
	
	ctx.moveTo(leftXb, topY) // left vertical top
	ctx.lineTo(leftXb,  bottomY) // right vertical bottom
	
	ctx.moveTo(rightX, topYb) // Top horizontal right 
	ctx.lineTo(leftX, topYb)  // Top horizontal bottom
	
	ctx.moveTo(rightX, bottomYb) // Bottom horizontal right 
	ctx.lineTo(leftX, bottomYb)  // Bottom horizontal bottom

		// Set some styles //
	const { lineWidth, color } = opts
	ctx.strokeStyle = color?? 'grey'
	ctx.lineWidth = lineWidth?? 1

		// Draw the Shape //
	ctx.stroke() // No Fill option; only Stroke
}


//----------------------------COMPLEX-----------------------//

const drawMovingParts = (ctx, opts = {}) => { // hypetenus, and highlighting lines
	const {width, height} = ctx.canvas
	const centX = width/2
	const centY = height/2

	const {phase, amplitude, color, lineWidth, fillStyle, padding } = opts

	// Draw rotating line // phase = degrees for our angle
	//const theta = phase * (Math.PI/180) // theta = angle in radians
	const {theta, sin, cos } = trigLookup[phase % 360]
	const rad = Math.PI * ( amplitude / 2 ) // length of hypotenus 
	const X = cos * rad
	const Y = sin * rad
	const originX  = centX + X
	const originY = centY + Y

	const _color = color?? 'teal'

	if( !fillStyle){
		// draw radial hypotenus // 
		ctx.beginPath()
		ctx.moveTo(centX, centY)
		ctx.lineTo(originX, originY) 
		ctx.closePath()
		ctx.strokeStyle = _color
		ctx.lineWidth = 2 
		ctx.stroke()
	}

	const margin = 25 // square  of +/- for being 'close'
	const close = (X * X < margin ) || (Y * Y < margin) 

		// horizontal crosshair // 
	drawLine(ctx, {
		originX: centX - (rad * padding),
		originY,
		endX: centX + (rad * padding), 
		endY: originY,
		color: 'teal'
	})

	drawLine(ctx, {
		originX,
		originY: centY - (rad * padding),
		endX: originX,
		endY: centY + (rad * padding), 
		color: 'teal'
	})
	
	if(fillStyle){
		drawTriangle(ctx, {
			X,		Y, 
			originX,
			originY,
			color: _color,
			fillStyle
		})
	}

	drawCircle(ctx, { 
		originX, 
		originY, 
		radius: 2, 
		color: close? 'white': _color,
		fillStyle: close? 'red' : color
	})
}

const drawWave = (ctx, amplitude, opts) => {
	// const z = Math.PI / 180 // multiply by degrees to get radians
	const { 
		originX, 	originY, 
		phase, 	length, 
		color, 	lineWidth, 
		cosine,  rotate, reverse 
	} = opts

	ctx.beginPath()
	

	const arr = Array.from({ length }, (_, i)=>{
		const phaseN = phase + i
		const { sin, cos } = trigLookup[ phaseN % 360 ]
		const sinCos = cosine? cos : sin // depends on which you need
		
		if(!rotate){
			ctx.lineTo(
				reverse? originX -i : originX +i,
				originY + (sinCos * amplitude)
			)
		}

		if(rotate){
			ctx.lineTo(
				originX + (sinCos * amplitude),
				reverse? originY -i : originY + i
			)
		}
	})

	// Set some styles //
	ctx.strokeStyle = color? color: 'red'
	ctx.lineWidth = lineWidth?? 1
	ctx.stroke()
	return arr 
}