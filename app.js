


	
//----------------////---- COMPLEX ----////----------------//
const animateWaves = (ctx, {
		radius, 
		phase, 
		color,
		padding, 
		length 
	}) => { // start of function 
		
	const {width, height} = ctx.canvas
	const centX = width/2
	const centY = height/2
	const paddedBounds = calcPaddedBoundries({
		centX, centY, radius, padding
	})
	 
	const {
		buffer, 
		rightX,			rightXb,
		leftX,			leftXb,
		topY,			topYb,
		bottomY,			bottomYb
	} = paddedBounds

	ctx.lineWidth = 3 

		// Left ( Sin ) // 
	drawWave(ctx, radius, { 
		originX: leftXb, 
		originY: centY, 
		phase,
		length,
		color,
		reverse: true
	})
		
		// Right ( Sin ) //
	drawWave(ctx, radius, {
		originX: rightXb, 
		originY: centY,
		phase,
		length,
		color,
	})

	
		// Top Cos //
	drawWave(ctx, radius, { 
		originX: centX, 
		originY: topYb, 
		phase,
		length,
		color, 
		rotate: true,
		cosine: true,
		reverse: true
	})
		
		// Bottom Cos //
	drawWave(ctx, radius, { 
		originX: centX, 
		originY: bottomYb, 
		phase,
		length,
		color, 
		rotate: true,
		cosine: true
	})	
}
 
const animate = (ctx, {amplitude, frequency, phase, color, color2 }) => {
	const {width, height} = ctx.canvas
	const centX = width/2
	const centY = height/2
	const freq = frequency / 1000
	const radius = amplitude * Math.PI / 2
	const padding = 1.2

	// reset and static elements //
	ctx.clearRect(0, 0, width, height)
	drawGridLines(ctx, { color })
	drawCircle(ctx, { centX, centY, radius, color })
	const paddedBounds = calcPaddedBoundries({
		centX,
		centY,
		radius,
		padding
	})

	drawBoundingSquare(ctx, paddedBounds, { color })

		// Draw the hypotenuse and it's guidelines
	drawMovingParts(ctx, {
		phase, 
		amplitude, 
		fillStyle: 'teal', 
		color: color2,
		padding
	}) 
	
	animateWaves(ctx, {
		radius,
		phase,
		color: color2,
		padding,
		length: width
	})

	ctx.beginPath()
	ctx.fillStyle = color;
	ctx.font = "36px serif";
	ctx.fillText("Sine Wave", width * 0.05, height * 0.55)
	ctx.fillText("Cosine Wave", width * 0.60, height * 0.10)

 
	ctx.font = "24px serif";
	ctx.fillText("(horizontal)", width * 0.07, height * 0.60)
	ctx.fillText("(vertical)", width * 0.65, height * 0.15)

}

const app = new Vue({
    el: "#app"
    ,data(){
		const msg = 'Vue.JS is working!'
 
		const amplitude = 50
		return({
			msg,
			canvas: null,
			ctx: null,
			amplitude,
			phase: 45,
			color: localStorage.getItem("lineColor")?? '#574747',
			color2: localStorage.getItem("waveColor")?? '#000000',
			isPaused: true,
			lastTime: 0
		})
    },
	 methods:{
		getCanvas(){
			this.canvas = document.querySelector('canvas')
			this.ctx = this.canvas.getContext('2d')
			this.onResize()
		},
		onResize(){
			if(!this.canvas) return null
			const {width, height} = this.canvas.getBoundingClientRect()
			this.ctx.canvas.width  = width
			this.ctx.canvas.height = height
			this.animate()
		},
		animate(){
			if( this.canvas && this.ctx){
				this.msg = animate(this.ctx, this)
			}
		},
		colorChange(e){ 
			const {value} = e.target 
			localStorage.setItem('lineColor', this.color )
			localStorage.setItem('waveColor', this.color2 )
			this.msg = value
			this.animate()
		}
	 }
    ,template: `<section>
	 	<canvas id="canvas"
	 		@resize="onResize()"
		></canvas>
		<h3>
			<pre>{{ msg }}</pre>
		</h3>
		<div class="control-panel">
	 		<button
			 @click="() => { this.isPaused = !this.isPaused }" 
			>
	 			{{ isPaused? 'START' : 'STOP' }}
			</button>

			<label>
				Primary Color: 
				<input 
					type="color"
					v-model="color"
					@change="colorChange"
				></input>
				{{ color }}
			</label>

			<label>
				Secondary Color: 
				<input 
					type="color"
					v-model="color2"
					@change="colorChange"
				></input>
				{{ color2 }}
			</label>

		</div>
	 </section>`
    ,mounted(){
		this.msg = 'Vue.Js is mounted and working!'
		this.getCanvas() // auto calls onResize
		this.animate()
		
		const step = (time) => {
			const delta = time - this.lastTime
			if(!this.isPaused && delta > 60 ){
				this.lastTime = time
				this.phase++
				this.animate()
			}			
			window.requestAnimationFrame(step)
		}

		window.requestAnimationFrame(step)
		 
	}
})