import React from 'react'
import Publicacion from './Publicacion'

function CenterContent() {
  return (
    <>
        <ul class="nav border-bottom justify-content-center ">
            <li class="nav-item menu-central">
                <a class="nav-link active" href="#">Para ti</a>
            </li>
            <li class="nav-item menu-central">
                <a class="nav-link" href="#">Siguiendo</a>
            </li>
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">Filtrar</a>
                <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#">Action</a></li>
                <li><hr class="dropdown-divider" /></li>
                <li><a class="dropdown-item" href="#">Separated link</a></li>
                </ul>
            </li>
        </ul>
        <div className='container-fluid'>
            <div className='row mt-4'>
                <div className='col border rounded-3'>
                    Publicando
                    <form>
                        <div className="form-group">
                            <textarea className='inputs' id="textarea" name="texta" rows="4" cols="50" placeholder='¿Que hace tú mascota hoy?'>
                            </textarea>
                        </div>
                        <button type="submit" className='btn submit-bt'>
                            Publicar
                        </button>
                    </form>
                </div>
            </div>
            <div className='row mt-4'>
                <div className='col'>
                    cards
                    <Publicacion />
                </div>
            </div>
        </div>
    </>
  )
}

export default CenterContent