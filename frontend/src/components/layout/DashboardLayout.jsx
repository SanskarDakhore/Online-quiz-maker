import React from 'react';
import AppSidebar from './AppSidebar';

const DashboardLayout = ({
  role,
  currentPath,
  onLogout,
  title,
  subtitle,
  iconClass,
  headerRight,
  loading = false,
  loadingText = 'Loading...',
  error = '',
  onRetry,
  children,
  onBrandClick,
  showBrandPulse = false,
  disableLogout = false,
}) => {
  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        <div className="col-md-3 col-lg-2 sidebar-custom p-3 min-vh-100">
          <AppSidebar
            role={role}
            currentPath={currentPath}
            onLogout={onLogout}
            onBrandClick={onBrandClick}
            showBrandPulse={showBrandPulse}
            logoutDisabled={disableLogout}
          />
        </div>

        <div className="col-md-9 col-lg-10">
          <div className="dashboard-main p-4">
            <div className="card card-glass mb-4 dashboard-header-card">
              <div className="card-body d-flex justify-content-between align-items-center gap-3 flex-wrap">
                <div>
                  <h1 className="gradient-text mb-1 dashboard-title">
                    {title} {iconClass ? <i className={`bi ${iconClass}`}></i> : null}
                  </h1>
                  {subtitle ? <p className="mb-0 dashboard-subtitle">{subtitle}</p> : null}
                </div>
                {headerRight}
              </div>
            </div>

            {loading ? (
              <div className="dashboard-status d-flex justify-content-center align-items-center">
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-white mb-0">{loadingText}</p>
                </div>
              </div>
            ) : null}

            {!loading && error ? (
              <div className="row justify-content-center">
                <div className="col-md-7 col-lg-6">
                  <div className="card card-glass p-4">
                    <h3 className="text-center mb-3">Something went wrong</h3>
                    <p className="text-center text-muted mb-4">{error}</p>
                    {onRetry ? (
                      <div className="text-center">
                        <button onClick={onRetry} className="btn btn-gradient">
                          <i className="bi bi-arrow-repeat me-2"></i>Retry
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {!loading && !error ? children : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
