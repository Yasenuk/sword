'use client';

import * as React from 'react';
import { ScrollProvider, useScroll } from '../features';

import styles from '../../app/page.module.css';

export const Scroll = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
	const { progress } = useScroll();

	return (
		<ScrollProvider>
			<div
				ref={ref}
				className={styles.progress}
				{...props}
			>
				{progress}
			</div>
		</ScrollProvider>
	);
});