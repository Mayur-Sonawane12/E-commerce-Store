import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaChartLine, 
  FaUsers, 
  FaBox, 
  FaShoppingCart, 
  FaDollarSign, 
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaDownload
} from 'react-icons/fa';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    salesData: [],
    userGrowth: [],
    topProducts: [],
    revenueByMonth: [],
    orderStatusDistribution: {},
    paymentMethodDistribution: {},
    categoryPerformance: [],
    totalRevenue: 0,
    revenueGrowth: 0,
    totalOrders: 0,
    orderGrowth: 0,
    newUsers: 0,
    userGrowth: 0,
    averageOrderValue: 0,
    aovGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30'); // days
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`http://localhost:5000/api/users/admin/analytics?days=${timeRange}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getGrowthIcon = (growth) => {
    const num = parseFloat(growth);
    return num >= 0 ? <FaArrowUp className="text-success" /> : <FaArrowDown className="text-danger" />;
  };

  const getGrowthClass = (growth) => {
    const num = parseFloat(growth);
    return num >= 0 ? 'text-success' : 'text-danger';
  };

  // Safe render function for data
  const safeRender = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object') return String(value);
    return String(value);
  };

  // Export functionality
  const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," + data;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (data, filename) => {
    const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonContent);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async (format) => {
    try {
      setExporting(true);
      
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          timeRange: `${timeRange} days`,
          generatedBy: 'Admin Analytics Dashboard'
        },
        summary: {
          totalRevenue: analytics.totalRevenue,
          totalOrders: analytics.totalOrders,
          newUsers: analytics.newUsers,
          averageOrderValue: analytics.averageOrderValue,
          revenueGrowth: analytics.revenueGrowth,
          orderGrowth: analytics.orderGrowth,
          userGrowth: analytics.userGrowth,
          aovGrowth: analytics.aovGrowth
        },
        salesData: analytics.salesData,
        userGrowth: analytics.userGrowth,
        topProducts: analytics.topProducts,
        categoryPerformance: analytics.categoryPerformance,
        orderStatusDistribution: analytics.orderStatusDistribution,
        paymentMethodDistribution: analytics.paymentMethodDistribution
      };

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `analytics_${timeRange}days_${timestamp}`;

      if (format === 'csv') {
        // Create CSV content
        let csvContent = "Metric,Value\n";
        csvContent += `Total Revenue,${formatCurrency(analytics.totalRevenue)}\n`;
        csvContent += `Total Orders,${analytics.totalOrders}\n`;
        csvContent += `New Users,${analytics.newUsers}\n`;
        csvContent += `Average Order Value,${formatCurrency(analytics.averageOrderValue)}\n`;
        csvContent += `Revenue Growth,${analytics.revenueGrowth}%\n`;
        csvContent += `Order Growth,${analytics.orderGrowth}%\n`;
        csvContent += `User Growth,${analytics.userGrowth}%\n`;
        csvContent += `AOV Growth,${analytics.aovGrowth}%\n\n`;
        
        // Add sales data
        csvContent += "Date,Orders,Revenue\n";
        analytics.salesData.forEach(data => {
          csvContent += `${safeRender(data._id)},${data.orders || 0},${formatCurrency(data.revenue || 0)}\n`;
        });
        
        csvContent += "\nTop Products\n";
        csvContent += "Product,Category,Sales,Revenue\n";
        analytics.topProducts.forEach(product => {
          csvContent += `${safeRender(product.title)},${safeRender(product.category)},${product.salesCount || 0},${formatCurrency(product.totalRevenue || 0)}\n`;
        });

        exportToCSV(csvContent, `${filename}.csv`);
      } else if (format === 'json') {
        exportToJSON(exportData, `${filename}.json`);
      } else if (format === 'excel') {
        // For Excel, we'll create a more comprehensive CSV that Excel can open
        let csvContent = "Analytics Dashboard Report\n";
        csvContent += `Generated on: ${new Date().toLocaleString()}\n`;
        csvContent += `Time Range: ${timeRange} days\n\n`;
        
        csvContent += "Key Metrics\n";
        csvContent += "Metric,Value\n";
        csvContent += `Total Revenue,${formatCurrency(analytics.totalRevenue)}\n`;
        csvContent += `Total Orders,${analytics.totalOrders}\n`;
        csvContent += `New Users,${analytics.newUsers}\n`;
        csvContent += `Average Order Value,${formatCurrency(analytics.averageOrderValue)}\n`;
        csvContent += `Revenue Growth,${analytics.revenueGrowth}%\n`;
        csvContent += `Order Growth,${analytics.orderGrowth}%\n`;
        csvContent += `User Growth,${analytics.userGrowth}%\n`;
        csvContent += `AOV Growth,${analytics.aovGrowth}%\n\n`;
        
        csvContent += "Sales Trend\n";
        csvContent += "Date,Orders,Revenue\n";
        analytics.salesData.forEach(data => {
          csvContent += `${safeRender(data._id)},${data.orders || 0},${formatCurrency(data.revenue || 0)}\n`;
        });
        
        csvContent += "\nTop Performing Products\n";
        csvContent += "Product,Category,Sales Count,Revenue\n";
        analytics.topProducts.forEach(product => {
          csvContent += `${safeRender(product.title)},${safeRender(product.category)},${product.salesCount || 0},${formatCurrency(product.totalRevenue || 0)}\n`;
        });
        
        csvContent += "\nCategory Performance\n";
        csvContent += "Category,Products,Sales,Revenue\n";
        analytics.categoryPerformance.forEach(category => {
          csvContent += `${safeRender(category.name)},${category.productCount || 0},${category.salesCount || 0},${formatCurrency(category.totalRevenue || 0)}\n`;
        });
        
        csvContent += "\nOrder Status Distribution\n";
        csvContent += "Status,Count\n";
        Object.entries(analytics.orderStatusDistribution).forEach(([status, count]) => {
          csvContent += `${safeRender(status)},${safeRender(count)}\n`;
        });
        
        csvContent += "\nPayment Method Distribution\n";
        csvContent += "Method,Orders,Revenue\n";
        Object.entries(analytics.paymentMethodDistribution).forEach(([method, data]) => {
          csvContent += `${safeRender(method)},${safeRender(data?.count, 0)},${formatCurrency(data?.total || 0)}\n`;
        });

        exportToCSV(csvContent, `${filename}_detailed.xlsx`);
      }
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error!</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchAnalytics}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Analytics Dashboard</h2>
        <div className="d-flex gap-2">
          <select 
            className="form-select" 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          <button className="btn btn-outline-primary" onClick={fetchAnalytics}>
            <FaEye className="me-1" />
            Refresh
          </button>
          <div className="dropdown">
            <button 
              className="btn btn-success dropdown-toggle" 
              type="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
              disabled={exporting}
            >
              <FaDownload className="me-1" />
              {exporting ? 'Exporting...' : 'Export'}
            </button>
            <ul className="dropdown-menu">
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                >
                  <FaDownload className="me-2" />
                  Export as CSV
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => handleExport('excel')}
                  disabled={exporting}
                >
                  <FaDownload className="me-2" />
                  Export as Excel
                </button>
              </li>
              <li>
                <button 
                  className="dropdown-item" 
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                >
                  <FaDownload className="me-2" />
                  Export as JSON
                </button>
              </li>
            </ul>
          </div>
                  </div>
        </div>

      {/* Key Metrics */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-primary shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total Revenue
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {formatCurrency(analytics.totalRevenue || 0)}
                  </div>
                  {/* <div className="text-xs text-muted">
                    {getGrowthIcon(analytics.revenueGrowth || 0)} 
                    <span className={getGrowthClass(analytics.revenueGrowth || 0)}>
                      {analytics.revenueGrowth || 0}% from last period
                    </span>
                  </div> */}
                </div>
                <div className="col-auto">
                  <FaDollarSign className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-success shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Total Orders
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {formatNumber(analytics.totalOrders || 0)}
                  </div>
                  <div className="text-xs text-muted">
                    {getGrowthIcon(analytics.orderGrowth || 0)} 
                    <span className={getGrowthClass(analytics.orderGrowth || 0)}>
                      {analytics.orderGrowth || 0}% from last period
                    </span>
                  </div>
                </div>
                <div className="col-auto">
                  <FaShoppingCart className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-info shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                    New Users
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {formatNumber(analytics.newUsers || 0)}
                  </div>
                  {/* <div className="text-xs text-muted">
                    {getGrowthIcon(analytics.userGrowth || 0)} 
                    <span className={getGrowthClass(analytics.userGrowth || 0)}>
                      {analytics.userGrowth || 0}% from last period
                    </span>
                  </div> */}
                </div>
                <div className="col-auto">
                  <FaUsers className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card border-left-warning shadow h-100 py-2">
            <div className="card-body">
              <div className="row no-gutters align-items-center">
                <div className="col mr-2">
                  <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Average Order Value
                  </div>
                  <div className="h5 mb-0 font-weight-bold text-gray-800">
                    {formatCurrency(analytics.averageOrderValue || 0)}
                  </div>
                  <div className="text-xs text-muted">
                    {getGrowthIcon(analytics.aovGrowth || 0)} 
                    <span className={getGrowthClass(analytics.aovGrowth || 0)}>
                      {analytics.aovGrowth || 0}% from last period
                    </span>
                  </div>
                </div>
                <div className="col-auto">
                  <FaChartLine className="fa-2x text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Sales Trend Chart */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Sales Trend</h5>
            </div>
            <div className="card-body">
              {analytics.salesData && Array.isArray(analytics.salesData) && analytics.salesData.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Orders</th>
                        <th>Revenue</th>
                        <th>Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.salesData.slice(0, 10).map((data, index) => (
                        <tr key={index}>
                          <td>{data._id ? new Date(safeRender(data._id)).toLocaleDateString() : 'N/A'}</td>
                          <td>{data.orders || 0}</td>
                          <td>{formatCurrency(data.revenue || 0)}</td>
                          <td>
                            <span className="text-success">
                              <FaArrowUp className="text-success" /> {(data.orders || 0) > 0 ? '100' : '0'}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No sales data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Order Status Distribution</h5>
            </div>
            <div className="card-body">
              {analytics.orderStatusDistribution && typeof analytics.orderStatusDistribution === 'object' && Object.keys(analytics.orderStatusDistribution).length > 0 ? (
                <div className="list-group list-group-flush">
                  {Object.entries(analytics.orderStatusDistribution).map(([status, count]) => (
                    <div key={status} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className={`badge bg-${
                        status === 'Delivered' ? 'success' :
                        status === 'Shipped' ? 'primary' :
                        status === 'Processing' ? 'info' :
                        status === 'Cancelled' ? 'danger' : 'secondary'
                      }`}>
                        {safeRender(status)}
                      </span>
                      <span className="badge bg-primary rounded-pill">{safeRender(count, 0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No order status data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Top Performing Products */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Top Performing Products</h5>
            </div>
            <div className="card-body">
              {analytics.topProducts && Array.isArray(analytics.topProducts) && analytics.topProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Sales</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topProducts.slice(0, 10).map((product, index) => (
                        <tr key={product._id || index}>
                          <td>
                            <div>
                              <strong>{safeRender(product.title, 'Unknown Product')}</strong>
                              <br />
                              <small className="text-muted">{safeRender(product.category, 'No Category')}</small>
                            </div>
                          </td>
                          <td>{product.salesCount || 0}</td>
                          <td>{formatCurrency(product.totalRevenue || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No product performance data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Category Performance</h5>
            </div>
            <div className="card-body">
              {analytics.categoryPerformance && Array.isArray(analytics.categoryPerformance) && analytics.categoryPerformance.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Products</th>
                        <th>Sales</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.categoryPerformance.map((category, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{safeRender(category.name, 'Unknown Category')}</strong>
                          </td>
                          <td>{category.productCount || 0}</td>
                          <td>{category.salesCount || 0}</td>
                          <td>{formatCurrency(category.totalRevenue || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No category performance data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Payment Method Distribution</h5>
            </div>
            <div className="card-body">
              {analytics.paymentMethodDistribution && typeof analytics.paymentMethodDistribution === 'object' && Object.keys(analytics.paymentMethodDistribution).length > 0 ? (
                <div className="list-group list-group-flush">
                  {Object.entries(analytics.paymentMethodDistribution).map(([method, data]) => (
                    <div key={method} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{safeRender(method, 'UNKNOWN').toUpperCase()}</strong>
                        <br />
                        <small className="text-muted">{safeRender(data?.count, 0)} orders</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{formatCurrency(data?.total || 0)}</div>
                        <small className="text-muted">{analytics.totalOrders > 0 ? (((data?.count || 0) / analytics.totalOrders) * 100).toFixed(1) : '0'}%</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No payment method data available</p>
              )}
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="col-lg-6 mb-4">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">User Growth</h5>
            </div>
            <div className="card-body">
              {analytics.userGrowth && Array.isArray(analytics.userGrowth) && analytics.userGrowth.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>New Users</th>
                        <th>Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.userGrowth.slice(0, 7).map((data, index) => (
                        <tr key={index}>
                          <td>{safeRender(data._id)}</td>
                          <td>{data.newUsers || 0}</td>
                          <td>
                            <span className="text-success">
                              <FaArrowUp className="text-success" /> {(data.newUsers || 0) > 0 ? '100' : '0'}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No user growth data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics; 