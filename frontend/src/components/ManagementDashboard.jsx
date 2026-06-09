import React, { useEffect, useState, useRef } from 'react';
import anime from 'animejs';
import { fetchReports, getImageUrl, downloadReportImage, downloadReportPdf } from '../services/api';
import './ManagementDashboard.css';

const ManagementDashboard = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [downloading, setDownloading] = useState({ image: false, pdf: false });
    const [filter, setFilter] = useState('All');
    const [imageError, setImageError] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchReports();
                setReports(data);
            } catch (error) {
                console.error("Failed to fetch reports:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const tableRef = useRef(null);

    useEffect(() => {
        if (!loading && tableRef.current) {
            const rows = tableRef.current.querySelectorAll('tr');
            anime.set(rows, { opacity: 0, translateX: -20 });
            anime({
                targets: rows,
                opacity: 1,
                translateX: 0,
                delay: anime.stagger(50),
                easing: 'easeOutQuad',
                duration: 500
            });
        }
    }, [loading, filter]);

    const getSeverityClass = (severity) => {
        switch (severity) {
            case 'High': return 'severity-high';
            case 'Medium': return 'severity-medium';
            case 'Low': return 'severity-low';
            default: return '';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity) {
            case 'High': return '🔴';
            case 'Medium': return '🟡';
            case 'Low': return '🟢';
            default: return '⚪';
        }
    };

    const handleDownloadImage = async (reportId, e) => {
        e?.stopPropagation();
        setDownloading(prev => ({ ...prev, image: true }));
        try {
            await downloadReportImage(reportId);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Failed to download image. The image may not be available.');
        } finally {
            setDownloading(prev => ({ ...prev, image: false }));
        }
    };

    const handleDownloadPdf = async (reportId, e) => {
        e?.stopPropagation();
        setDownloading(prev => ({ ...prev, pdf: true }));
        try {
            await downloadReportPdf(reportId);
        } catch (err) {
            console.error('PDF generation failed:', err);
            alert('Failed to generate PDF report.');
        } finally {
            setDownloading(prev => ({ ...prev, pdf: false }));
        }
    };

    const filteredReports = filter === 'All'
        ? reports
        : reports.filter(r => r.severity === filter);

    const severityCounts = {
        All: reports.length,
        High: reports.filter(r => r.severity === 'High').length,
        Medium: reports.filter(r => r.severity === 'Medium').length,
        Low: reports.filter(r => r.severity === 'Low').length,
    };

    return (
        <div className="dashboard-container glass-panel">
            {/* Header with filter pills */}
            <div className="dashboard-header">
                <div className="dashboard-header-left">
                    <h2>Recent Reports</h2>
                    <span className="report-count">{filteredReports.length} of {reports.length}</span>
                </div>
                <div className="filter-pills">
                    {['All', 'High', 'Medium', 'Low'].map(sev => (
                        <button
                            key={sev}
                            onClick={() => setFilter(sev)}
                            className={`filter-pill ${filter === sev ? 'filter-pill-active' : ''} ${sev !== 'All' ? `filter-pill-${sev.toLowerCase()}` : ''}`}
                        >
                            {sev !== 'All' && <span className="filter-dot">{getSeverityIcon(sev)}</span>}
                            {sev} ({severityCounts[sev]})
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading historical data from AWS...</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Preview</th>
                                <th>Date</th>
                                <th>Damage Type</th>
                                <th>Severity</th>
                                <th>Confidence</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody ref={tableRef}>
                            {filteredReports.map((report) => (
                                <tr
                                    key={report.id}
                                    className="report-row"
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <td className="col-id">#{report.id}</td>
                                    <td className="col-preview">
                                        <div className="preview-thumb">
                                            {!imageError[report.id] ? (
                                                <img
                                                    src={getImageUrl(report.image_url)}
                                                    alt={`Report ${report.id}`}
                                                    onError={() => setImageError(prev => ({ ...prev, [report.id]: true }))}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="preview-placeholder">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                                        <path d="M21 15l-5-5L5 21" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="col-date">
                                        {new Date(report.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
                                            ' at ' +
                                            new Date(report.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </td>
                                    <td className="col-issues">{report.damage_type}</td>
                                    <td className="col-severity">
                                        <span className={`badge ${getSeverityClass(report.severity)}`}>
                                            {getSeverityIcon(report.severity)} {report.severity}
                                        </span>
                                    </td>
                                    <td className="col-confidence">
                                        <div className="confidence-bar-wrapper">
                                            <div className="confidence-bar" style={{ width: `${Math.round(report.confidence * 100)}%` }}></div>
                                            <span className="confidence-text">{Math.round(report.confidence * 100)}%</span>
                                        </div>
                                    </td>
                                    <td className="col-action">
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action btn-download-img"
                                                onClick={(e) => handleDownloadImage(report.id, e)}
                                                title="Download Image"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <path d="M21 15l-5-5L5 21" />
                                                </svg>
                                            </button>
                                            <button
                                                className="btn-action btn-download-pdf"
                                                onClick={(e) => handleDownloadPdf(report.id, e)}
                                                title="Download PDF Report"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                    <line x1="12" y1="18" x2="12" y2="12" />
                                                    <polyline points="9 15 12 18 15 15" />
                                                </svg>
                                            </button>
                                            <button
                                                className="btn-action btn-view"
                                                onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}
                                                title="View Details"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredReports.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="empty-row">
                                        <div className="empty-state">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                            <p>No reports found</p>
                                            <span>Upload an image from the Dashboard to create a report</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ═══════════════════════════════════════════ */}
            {/* Detail Modal */}
            {/* ═══════════════════════════════════════════ */}
            {selectedReport && (
                <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button className="modal-close" onClick={() => setSelectedReport(null)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>

                        {/* Modal Header */}
                        <div className="modal-header">
                            <div className="modal-title-section">
                                <h3 className="modal-title">Report #{selectedReport.id}</h3>
                                <span className="modal-date">
                                    {new Date(selectedReport.created_at).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) +
                                        ' at ' +
                                        new Date(selectedReport.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </span>
                            </div>
                            <span className={`badge badge-lg ${getSeverityClass(selectedReport.severity)}`}>
                                {getSeverityIcon(selectedReport.severity)} {selectedReport.severity} Severity
                            </span>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body">
                            {/* Image Section with Detection Boxes */}
                            <div className="modal-image-section">
                                <div className="modal-image-wrapper">
                                    {!imageError[`modal-${selectedReport.id}`] ? (
                                        <div className="detection-image-container">
                                            <img
                                                src={getImageUrl(selectedReport.image_url)}
                                                alt={`Road damage ${selectedReport.id}`}
                                                className="modal-image"
                                                onError={() => setImageError(prev => ({ ...prev, [`modal-${selectedReport.id}`]: true }))}
                                            />
                                            {/* Render detection bounding boxes */}
                                            {(() => {
                                                try {
                                                    const dets = selectedReport.detection_data ? JSON.parse(selectedReport.detection_data) : [];
                                                    return dets.map((det, idx) => {
                                                        const [x, y, w, h] = det.bbox || [];
                                                        if (x == null) return null;
                                                        const sevColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
                                                        const borderColor = sevColors[det.severity] || '#3b82f6';
                                                        return (
                                                            <div key={idx} className="detection-box" style={{
                                                                left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`,
                                                                borderColor: borderColor
                                                            }}>
                                                                <span className="detection-label" style={{ backgroundColor: borderColor }}>
                                                                    {det.type} {Math.round(det.confidence * 100)}%
                                                                </span>
                                                            </div>
                                                        );
                                                    });
                                                } catch { return null; }
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="modal-image-placeholder">
                                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                                <circle cx="8.5" cy="8.5" r="1.5" />
                                                <path d="M21 15l-5-5L5 21" />
                                            </svg>
                                            <p>Image not available</p>
                                        </div>
                                    )}
                                    <div className="modal-image-overlay">
                                        <span className="image-source-badge">
                                            {selectedReport.image_url?.startsWith('http') ? '☁️ AWS S3' : '💾 Local'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="modal-details-section">
                                <div className="detail-grid">
                                    <div className="detail-card">
                                        <span className="detail-label">Damage Type</span>
                                        <span className="detail-value">{selectedReport.damage_type}</span>
                                    </div>
                                    <div className="detail-card">
                                        <span className="detail-label">Confidence</span>
                                        <span className="detail-value detail-value-accent">{Math.round(selectedReport.confidence * 100)}%</span>
                                    </div>
                                    <div className="detail-card">
                                        <span className="detail-label">Latitude</span>
                                        <span className="detail-value font-mono">{selectedReport.latitude}</span>
                                    </div>
                                    <div className="detail-card">
                                        <span className="detail-label">Longitude</span>
                                        <span className="detail-value font-mono">{selectedReport.longitude}</span>
                                    </div>
                                </div>

                                {/* Strategic Advisory Note */}
                                {selectedReport.advisory_note && (
                                    <div className="advisory-box">
                                        <span className="advisory-label">💡 Strategic Advisory</span>
                                        <p className="advisory-text">{selectedReport.advisory_note}</p>
                                    </div>
                                )}

                                {/* Storage Info */}
                                <div className="storage-info">
                                    <span className="storage-label">Storage Location</span>
                                    <span className="storage-url" title={selectedReport.image_url}>
                                        {selectedReport.image_url?.startsWith('http')
                                            ? `s3://${selectedReport.image_url.split('.s3.')[0]?.split('//')[1] || 'bucket'}/...`
                                            : selectedReport.image_url}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Download Actions */}
                        <div className="modal-actions">
                            <button
                                className="modal-btn modal-btn-image"
                                onClick={(e) => handleDownloadImage(selectedReport.id, e)}
                                disabled={downloading.image}
                            >
                                {downloading.image ? (
                                    <span className="btn-loading"></span>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                )}
                                Download Image
                            </button>
                            <button
                                className="modal-btn modal-btn-pdf"
                                onClick={(e) => handleDownloadPdf(selectedReport.id, e)}
                                disabled={downloading.pdf}
                            >
                                {downloading.pdf ? (
                                    <span className="btn-loading"></span>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                        <line x1="12" y1="18" x2="12" y2="12" />
                                        <polyline points="9 15 12 18 15 15" />
                                    </svg>
                                )}
                                Download PDF Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagementDashboard;
