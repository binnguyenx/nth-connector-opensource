import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { supabase } from './supabase'
import SubmitForm from './components/SubmitForm'
import UpdateForm from './components/UpdateForm'
import Gallery from './components/Gallery'
import type { Post } from './types'

const SUBMISSIONS_OPEN = true


type Page = 'gallery' | 'submit' | 'update'

export default function App() {
  const [page, setPage] = useState<Page>('gallery')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
async function fetchPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('id, name, class, secondary_class, school_year, city, country, caption, image_url, lat, lng, instagram, facebook, linkedin, created_at')
      .order('created_at', { ascending: false })
      .limit(10000)

    if (!error) setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

  function handleSuccess() {
    setPage('gallery')
    fetchPosts()
  }

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="header-title">
            <h1>The Pétrus Ký - Nguyen Thuong Hien Network</h1>
            <p className="header-sub">Mạng lưới Cựu học sinh Trường Pétrus Ký - Nguyễn Thượng Hiền</p>
          </div>
          <nav className="site-nav desktop-nav">
            <button className={page === 'gallery' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('gallery')}>
              Mạng lưới
            </button>
            {SUBMISSIONS_OPEN && (
              <button className={page === 'submit' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('submit')}>
                Tham gia
              </button>
            )}
            <button className={page === 'update' ? 'nav-btn active' : 'nav-btn'} onClick={() => setPage('update')}>
              Chỉnh sửa
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {page === 'gallery' || !SUBMISSIONS_OPEN ? (
          <Gallery posts={posts} loading={loading} />
        ) : page === 'update' ? (
          <UpdateForm />
        ) : (
          <SubmitForm onSuccess={handleSuccess} posts={posts} />
        )}
      </main>

      <footer className="site-footer">
        <p>The PK-NTH Network · Petrus Ký · Nguyễn Thượng Hiền · Est. 1927</p>
        <p>Built By Jimmy Nguyen CA1 20-23, with love ❤️</p>
      </footer>

      <nav className="mobile-nav" aria-label="Main navigation">
        <button className={page === 'gallery' ? 'mobile-nav-btn active' : 'mobile-nav-btn'} onClick={() => setPage('gallery')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 1-1.06 1.06L12 5.69l-8.16 7.9a.75.75 0 0 1-1.06-1.06l8.69-8.69Z"/>
            <path d="M12 6.94l6 5.81V19.5A1.5 1.5 0 0 1 16.5 21h-3v-4.5h-3V21h-3A1.5 1.5 0 0 1 6 19.5v-6.75l6-5.81Z"/>
          </svg>
          <span>Mạng lưới</span>
        </button>
        {SUBMISSIONS_OPEN && (
          <button className={page === 'submit' ? 'mobile-nav-btn active' : 'mobile-nav-btn'} onClick={() => setPage('submit')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z" clipRule="evenodd"/>
            </svg>
            <span>Tham gia</span>
          </button>
        )}
        <button className={page === 'update' ? 'mobile-nav-btn active' : 'mobile-nav-btn'} onClick={() => setPage('update')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"/>
            <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z"/>
          </svg>
          <span>Chỉnh sửa</span>
        </button>
      </nav>

      <Analytics />
    </div>
  )
}
