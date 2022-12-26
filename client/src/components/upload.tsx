import clsx from 'clsx';
import React, {
	useRef,
	useState,
	type ButtonHTMLAttributes,
	type FC,
	type FormEventHandler,
	type SVGAttributes,
} from 'react';

const SvgClose: FC<SVGAttributes<SVGElement>> = props => (
	<svg viewBox='4 4 8 8' {...props}>
		<path d='M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z' />
	</svg>
);

type FileKeyed = {readonly file: File; readonly key: string};

function formatFileSize(bytes: number) {
	const thresh = 1024;

	if (Math.abs(bytes) < thresh) {
		return `${bytes} B`;
	}

	const units = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let u = -1;

	do {
		bytes /= thresh;
		++u;
	} while (
		Math.round(Math.abs(bytes) * 10) / 10 >= thresh
		&& u < units.length - 1
	);

	return `${bytes.toFixed(1)} ${units[u]!}`;
}

const Files: FC<{
	files: readonly FileKeyed[];
	removeFile: (key: string) => () => void;
}> = ({files, removeFile}) => {
	if (files.length === 0) {
		return null;
	}

	return (
		<div className='mt-4'>
			<div className='text-xl mb-3'>Files to upload</div>
			<div className='flex flex-wrap gap-3 border-slate-600 border-2 rounded p-2'>
				{files.map(({file, key}) => (
					<div
						key={key}
						className='flex border px-2 py-1 gap-2 border-slate-500 rounded items-center justify-center'
					>
						{file.name}
						<span className='text-sm'>({formatFileSize(file.size)})</span>
						<button
							type='button'
							className='cursor-pointer'
							onClick={removeFile(key)}
						>
							<SvgClose className='w-3 fill-current' />
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

const PrimaryButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = props => (
	<button
		type='button'
		{...props}
		className={clsx(
			`
				cursor-pointer
				bg-blue-500
				hover:bg-blue-700
				active:bg-blue-700
				focus:outline-none
				focus:ring
				focus:ring-blue-300
				hover:transition-colors
				duration-200
				text-white
				font-semibold
				rounded
				py-2
				px-6
			`,
			props.className,
		)}
	>
		{props.children}
	</button>
);

const SecondaryButton: FC<ButtonHTMLAttributes<HTMLButtonElement>> = props => (
	<button
		type='button'
		{...props}
		className={clsx(
			`
			bg-transparent
			cursor-pointer
			text-m
			text-blue-500
			font-semibold
			hover:bg-blue-500
			hover:text-white
			hover:transition-colors
			duration-200
			py-1
			px-3
			border
			border-blue-500
			hover:border-transparent
			rounded

			disabled:cursor-not-allowed
		`,
			props.className,
		)}
	/>
);

export const Upload: FC = () => {
	const folderRef = useRef<HTMLInputElement>(null);
	const fileRef = useRef<HTMLInputElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const counter = useRef(0);

	const [files, setFiles] = useState<readonly FileKeyed[]>([]);
	const [uploading, setUploading] = useState(false);

	const handleInput = () => {
		const newFiles = [
			...(folderRef.current?.files ?? []),
			...(fileRef.current?.files ?? []),
		];

		setFiles([
			...files,
			...newFiles.map(file => ({
				file,
				key: `${++counter.current}`,
			})),
		]);

		formRef.current?.reset();
	};

	const removeFile = (key: string) => () => {
		setFiles(files.filter(file => file.key !== key));
	};

	const onSubmit: FormEventHandler<HTMLFormElement> = async event => {
		event.preventDefault();

		const form = new FormData();

		for (const {file} of files) {
			form.append('file', file);
		}

		try {
			setUploading(true);
			const request = await fetch('/upload', {
				method: 'POST',
				body: form,
			});

			await request.text();

			setFiles([]);
		} catch {}

		setUploading(false);
	};

	return (
		<form
			ref={formRef}
			className='flex flex-col items-start'
			onSubmit={onSubmit}
		>
			<h1 className='text-4xl mb-4'>File uploader</h1>

			<SecondaryButton
				type='button'
				disabled={uploading}
				className='mb-3'
				onClick={() => {
					fileRef.current?.click();
				}}
			>
				Upload files
			</SecondaryButton>
			<SecondaryButton
				type='button'
				disabled={uploading}
				onClick={() => {
					folderRef.current?.click();
				}}
			>
				or upload a directory
			</SecondaryButton>

			<Files files={files} removeFile={removeFile} />

			<input
				ref={folderRef}
				multiple
				hidden
				// @ts-expect-error It does exist!
				// eslint-disable-next-line react/no-unknown-property
				directory='directory'
				name='folder'
				type='file'
				webkitdirectory='webkitdirectory'
				disabled={uploading}
				onInput={handleInput}
			/>

			<input
				ref={fileRef}
				multiple
				hidden
				type='file'
				name='file'
				disabled={uploading}
				onInput={handleInput}
			/>
			<PrimaryButton
				type='submit'
				className='mt-5'
				disabled={uploading || files.length === 0}
			>
				{uploading ? 'Uploading...' : 'Submit'}
			</PrimaryButton>
		</form>
	);
};
