import '../../styles/ui/MyInput.scss'

const MyInput = ({ placeholder, value, onChange, type, pattern }) => {
	return (
		<input
			className='input'
			placeholder={placeholder}
			value={value}
			onChange={onChange}
			type={type}
		/>
	)
}

export default MyInput
