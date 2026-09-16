'use client';

import * as React from 'react';

import styles from '@/app/page.module.css';
import { ScrollProvider, useScroll } from '@/libs/features';

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