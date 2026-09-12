'use client';

import * as React from 'react';

interface ScrollContextProps {
	progress: number | null;
	setProgress: (progress: number | null) => void;
}

const ScrollContext = React.createContext<ScrollContextProps | null>(null);

const ScrollProvider = ({ children }: { children: React.ReactNode }) => {
	const [progress, setProgress] = React.useState<number | null>(0);

	React.useEffect(() => {
		const onScroll = () => {
			const docHeight =
				document.documentElement.scrollHeight - 1 - window.innerHeight;
			const percent = docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0;

			setProgress(percent);
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<ScrollContext.Provider value={{ progress, setProgress }}>
			{children}
		</ScrollContext.Provider>
	);
}

const useScroll = () => {
	const context = React.useContext(ScrollContext);
	if (!context) {
		throw new Error('useScroll must be used within a ScrollProvider');
	}

	return context;
};

export { ScrollProvider, useScroll }