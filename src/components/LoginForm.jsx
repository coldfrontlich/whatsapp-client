import React, { useState } from 'react'
import MyInput from "./ui/MyInput"
import MyButton from "./ui/MyButton"

const LoginForm = ({ onLogin }) => {
	const [idInstance, setIdInstance] = useState('')
	const [apiTokenInstance, setApiTokenInstance] = useState('')

	const handleSubmit = e => {
		e.preventDefault()
		if (idInstance && apiTokenInstance) {
			onLogin(idInstance, apiTokenInstance)
		} else {
			console.log(e)
		}
	}

	return (
		<div className='login-container'>
			<form className='login-form' onSubmit={handleSubmit}>
				<h1>Вход в WhatsApp</h1>
				<MyInput
					type='text'
					placeholder='idInstance'
					value={idInstance}
					onChange={e => setIdInstance(e.target.value)}
				/>
				<MyInput
					type='password'
					placeholder='apiTokenInstance'
					value={apiTokenInstance}
					onChange={e => setApiTokenInstance(e.target.value)}
				/>
				<MyButton type='submit'>Вход</MyButton>
			</form>
		</div>
	)
}

export default LoginForm
