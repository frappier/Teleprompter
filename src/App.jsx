import React, { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Pause, 
  Upload, 
  Sun, 
  Moon, 
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Type
} from 'lucide-react'
import './App.css'

function App() {
  const [text, setText] = useState('')
  const [lines, setLines] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(50)
  const [currentLine, setCurrentLine] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fontSize, setFontSize] = useState(32)
  
  const intervalRef = useRef(null)
  const fileInputRef = useRef(null)
  const teleprompterRef = useRef(null)
  const textDisplayRef = useRef(null)

  useEffect(() => {
    if (text) {
      const textLines = text.split('\n').filter(line => line.trim() !== '')
      setLines(textLines)
      setCurrentLine(0)
    }
  }, [text])

  useEffect(() => {
    if (isPlaying && lines.length > 0) {
      // Enhanced speed calculation for 1-100% range
      // 1% = 10000ms (10 seconds per line), 100% = 100ms (0.1 seconds per line)
      const intervalTime = Math.max(100, (101 - speed) * 100)
      
      intervalRef.current = setInterval(() => {
        setCurrentLine(prev => {
          if (prev >= lines.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, intervalTime)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isPlaying, speed, lines.length])

  // Smooth scroll to keep current line centered
  useEffect(() => {
    if (textDisplayRef.current && lines.length > 0) {
      const currentLineElement = textDisplayRef.current.querySelector('.text-line.current')
      if (currentLineElement) {
        const container = teleprompterRef.current
        const containerHeight = container.clientHeight
        const elementTop = currentLineElement.offsetTop
        const elementHeight = currentLineElement.offsetHeight
        
        // Calculate scroll position to center the current line
        const scrollTop = elementTop - (containerHeight / 2) + (elementHeight / 2)
        
        // Use smooth scrolling with consistent timing
        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        })
      }
    }
  }, [currentLine, lines.length])

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'text/plain') {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        setText(e.target.result)
      }
      reader.readAsText(file)
    } else {
      alert('Please upload a valid text file (.txt)')
    }
  }

  const togglePlayPause = () => {
    if (lines.length === 0) {
      alert('Please upload a text file first')
      return
    }
    setIsPlaying(!isPlaying)
  }

  const resetToStart = () => {
    setCurrentLine(0)
    setIsPlaying(false)
  }

  const moveLineUp = () => {
    setCurrentLine(prev => Math.max(0, prev - 1))
  }

  const moveLineDown = () => {
    setCurrentLine(prev => Math.min(lines.length - 1, prev + 1))
  }

  const handleLineSliderChange = (event) => {
    const newLine = parseInt(event.target.value)
    setCurrentLine(newLine)
  }

  const increaseFontSize = () => {
    setFontSize(prev => Math.min(60, prev + 2))
  }

  const decreaseFontSize = () => {
    setFontSize(prev => Math.max(16, prev - 2))
  }

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Control Panel */}
      <div className="control-panel">
        <div className="control-section">
          <h2>Teleprompter Controls</h2>
          
          {/* Theme Toggle */}
          <button 
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* File Upload */}
        <div className="control-section">
          <h3>Upload Script</h3>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <button 
            className="upload-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={16} />
            Choose Text File
          </button>
          {fileName && <p className="file-name">Loaded: {fileName}</p>}
        </div>

        {/* Playback Controls */}
        <div className="control-section">
          <h3>Playback</h3>
          <div className="playback-controls">
            <button 
              className="control-btn primary"
              onClick={togglePlayPause}
              disabled={lines.length === 0}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button 
              className="control-btn"
              onClick={resetToStart}
              disabled={lines.length === 0}
            >
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        {/* Speed Control */}
        <div className="control-section">
          <h3>Speed Control</h3>
          <div className="speed-control">
            <label>Speed: {speed}%</label>
            <input
              type="range"
              min="1"
              max="100"
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="speed-slider"
            />
            <div className="speed-labels">
              <span>Ultra Slow</span>
              <span>Fast</span>
            </div>
          </div>
        </div>

        {/* Font Size Control */}
        <div className="control-section">
          <h3>Font Size</h3>
          <div className="font-size-control">
            <label>Size: {fontSize}px</label>
            <div className="font-size-buttons">
              <button 
                className="font-btn"
                onClick={decreaseFontSize}
                disabled={fontSize <= 16}
              >
                <Type size={14} />
                Smaller
              </button>
              <button 
                className="font-btn"
                onClick={increaseFontSize}
                disabled={fontSize >= 60}
              >
                <Type size={18} />
                Larger
              </button>
            </div>
            <input
              type="range"
              min="16"
              max="60"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="font-size-slider"
            />
          </div>
        </div>

        {/* Manual Navigation */}
        <div className="control-section">
          <h3>Manual Navigation</h3>
          <div className="manual-controls">
            <button 
              className="nav-btn"
              onClick={moveLineUp}
              disabled={lines.length === 0 || currentLine === 0}
            >
              <ChevronUp size={16} />
              Previous Line
            </button>
            <button 
              className="nav-btn"
              onClick={moveLineDown}
              disabled={lines.length === 0 || currentLine >= lines.length - 1}
            >
              <ChevronDown size={16} />
              Next Line
            </button>
          </div>
          
          {lines.length > 0 && (
            <div className="line-slider-container">
              <label>Line: {currentLine + 1} / {lines.length}</label>
              <input
                type="range"
                min="0"
                max={lines.length - 1}
                value={currentLine}
                onChange={handleLineSliderChange}
                className="line-slider"
              />
            </div>
          )}
        </div>
      </div>

      {/* Teleprompter Display */}
      <div className="teleprompter-display" ref={teleprompterRef}>
        {lines.length === 0 ? (
          <div className="placeholder">
            <Upload size={48} />
            <h2>Upload a text file to get started</h2>
            <p>Choose a .txt file from your computer to display on the teleprompter</p>
          </div>
        ) : (
          <div className="text-display" ref={textDisplayRef} style={{ fontSize: `${fontSize}px` }}>
            {lines.map((line, index) => (
              <div
                key={index}
                className={`text-line ${index === currentLine ? 'current' : ''}`}
              >
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
