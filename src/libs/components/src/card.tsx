'use client';

import * as React from 'react';

import styles from '@/app/page.module.css';

const Card = () => {
	const cardRef = React.useRef<HTMLDivElement>(null);

	const frame = React.useRef(0);

	React.useEffect(() => () => cancelAnimationFrame(frame.current), []);

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const { clientX, clientY } = e;

		cancelAnimationFrame(frame.current);
		frame.current = requestAnimationFrame(() => {
			const card = cardRef.current;
			if (!card) return;

			const cx = window.innerWidth / 2;
			const cy = window.innerHeight / 2;

			const rotateY = ((clientX - cx) / cx) * 20;
			const rotateX = ((cy - clientY) / cy) * 20;
			const translateX = ((clientX - cx) / cx) * 50;
			const translateY = ((clientY - cy) / cy) * 50;

			card.style.transform =
				`rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateX(${-translateX}px) translateY(${-translateY}px)`;
		});
	};

	return (
		<div className={styles.container}>
			<div className={styles.overlay}>
				<div className={styles.main} onMouseMove={handleMouseMove}>
					<div className={styles.card} ref={cardRef} />
					<div className={styles.environment} />
				</div>
			</div>
		</div>
	);
};