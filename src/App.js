import { useState } from 'react'
import LoginForm from './components/LoginForm'
import useAuthStore from './stores/store'
import axios from 'axios'
import ChatLayout from './components/ChatLayout'

const App = () => {
	const { idInstance, setCredentials } = useAuthStore()
	const [isLoggedIn, setIsLoggedIn] = useState(idInstance)

	const handleLogin = async (id, token) => {
		try {
			const response = await axios.get(
				`https://${id.slice(0, 4)}.api.green-api.com/waInstance${id}/getStateInstance/${token}`
			)
			if (response.data.stateInstance === 'authorized') {
				setCredentials(id, token)
				setIsLoggedIn(true)
			} else {
				console.log('Ошибка авторизации! Проверьте данные.')
			}
		} catch (e) {
			console.log(e)
		}
	}

	return (
		<div>
			{isLoggedIn ? (
				<ChatLayout />
			) : (
				<LoginForm onLogin={handleLogin} />
			)}
		</div>
	)
}

export default App
