<script>
	import '../app.css';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Your Name - Personal Website</title>
	<meta name="description" content="A fun and eclectic personal website showcasing projects, writing, music, comedy, and art" />
</svelte:head>

<main>
	<slot />
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: Arial, sans-serif;
		background: #ff8c42;
		min-height: 100vh;
		position: relative;
		overflow-x: hidden;
	}

	:global(body::before) {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: 
			radial-gradient(2px 2px at 20px 30px, #ff6b6b, transparent),
			radial-gradient(2px 2px at 40px 70px, #4ecdc4, transparent),
			radial-gradient(1px 1px at 90px 40px, #45b7d1, transparent),
			radial-gradient(1px 1px at 130px 80px, #96ceb4, transparent),
			radial-gradient(2px 2px at 160px 30px, #feca57, transparent);
		background-repeat: repeat;
		background-size: 200px 100px;
		opacity: 0.3;
		z-index: -1;
		animation: twinkle 20s linear infinite;
	}

	@keyframes twinkle {
		0%, 100% { opacity: 0.3; }
		50% { opacity: 0.6; }
	}

	main {
		min-height: 100vh;
		position: relative;
		z-index: 1;
	}
</style> 