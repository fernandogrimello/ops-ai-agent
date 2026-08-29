"use client"

import { useState } from "react"

const API_URL = "http://localhost:3001"

export default function LandingPage() {
  const [nome, setNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [servico, setServico] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState("")

  async function handleSubmit(e: any) {
    e.preventDefault()
    
    const res = await fetch(API_URL + "/customers", {
      method: "POST",
      body: JSON.stringify({ name: nome, phone: telefone }),
    })

    const data = await res.json()
    
    if (res.ok) {
      setEnviado(true)
    } else {
      setErro(data.error)
    }
  }

  if (enviado) {
    return <div>Obrigado! Entraremos em contato.</div>
  }

  return (
    <div style={{padding: "40px", maxWidth: "500px", margin: "0 auto"}}>
      <h1>ClimaTech</h1>
      <p>Solicite um orcamento gratuito para instalacao ou manutencao de ar-condicionado.</p>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome</label>
          <input 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={{display: "block", width: "100%", marginBottom: "10px"}}
          />
        </div>
        
        <div>
          <label>Telefone</label>
          <input 
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            style={{display: "block", width: "100%", marginBottom: "10px"}}
          />
        </div>

        <div>
          <label>Tipo de servico</label>
          <select 
            value={servico}
            onChange={(e) => setServico(e.target.value)}
            style={{display: "block", width: "100%", marginBottom: "10px"}}
          >
            <option value="">Selecione...</option>
            <option value="instalacao">Instalacao</option>
            <option value="manutencao">Manutencao</option>
            <option value="orcamento">Orcamento</option>
          </select>
        </div>

        {erro && <p style={{color: "red"}}>{erro}</p>}
        
        <button type="submit">Solicitar orcamento</button>
      </form>
    </div>
  )
}
