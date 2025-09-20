# Analytics API Server
# Pacific Reef Hotel Management System - Analytics REST API

from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
import logging
import os
from hotel_analytics import HotelAnalytics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Initialize analytics engine
analytics_engine = HotelAnalytics()

# Configuration
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
app.config['PORT'] = int(os.getenv('FLASK_PORT', 5000))

@app.route('/')
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'service': 'Pacific Reef Hotel Analytics API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/analytics/occupancy')
def get_occupancy_analytics():
    """
    Get occupancy analytics for a specified date range.
    
    Query Parameters:
        start_date (str): Start date in YYYY-MM-DD format (optional, defaults to 30 days ago)
        end_date (str): End date in YYYY-MM-DD format (optional, defaults to today)
    
    Returns:
        JSON response with occupancy analytics data
    """
    try:
        # Get date parameters or use defaults
        end_date = request.args.get('end_date', datetime.now().strftime('%Y-%m-%d'))
        start_date = request.args.get('start_date', 
                                    (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
        
        # Validate date format
        datetime.strptime(start_date, '%Y-%m-%d')
        datetime.strptime(end_date, '%Y-%m-%d')
        
        # Get analytics data
        data = analytics_engine.get_occupancy_analytics(start_date, end_date)
        
        return jsonify({
            'success': True,
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid date format. Use YYYY-MM-DD: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 400
        
    except Exception as e:
        logger.error(f"Error in occupancy analytics endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/analytics/revenue')
def get_revenue_analytics():
    """
    Get revenue analytics for a specified date range.
    
    Query Parameters:
        start_date (str): Start date in YYYY-MM-DD format (optional)
        end_date (str): End date in YYYY-MM-DD format (optional)
    
    Returns:
        JSON response with revenue analytics data
    """
    try:
        # Get date parameters or use defaults
        end_date = request.args.get('end_date', datetime.now().strftime('%Y-%m-%d'))
        start_date = request.args.get('start_date', 
                                    (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
        
        # Validate date format
        datetime.strptime(start_date, '%Y-%m-%d')
        datetime.strptime(end_date, '%Y-%m-%d')
        
        # Get analytics data
        data = analytics_engine.get_revenue_analytics(start_date, end_date)
        
        return jsonify({
            'success': True,
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid date format. Use YYYY-MM-DD: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 400
        
    except Exception as e:
        logger.error(f"Error in revenue analytics endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/analytics/customers')
def get_customer_analytics():
    """
    Get customer analytics and segmentation data.
    
    Returns:
        JSON response with customer analytics data
    """
    try:
        # Get analytics data
        data = analytics_engine.get_customer_analytics()
        
        return jsonify({
            'success': True,
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in customer analytics endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/analytics/rooms')
def get_room_performance_analytics():
    """
    Get room performance analytics.
    
    Returns:
        JSON response with room performance data
    """
    try:
        # Get analytics data
        data = analytics_engine.get_room_performance_analytics()
        
        return jsonify({
            'success': True,
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in room performance analytics endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/analytics/predictions')
def get_predictive_analytics():
    """
    Get predictive analytics and demand forecasting.
    
    Returns:
        JSON response with predictive analytics data
    """
    try:
        # Get analytics data
        data = analytics_engine.generate_predictive_analytics()
        
        return jsonify({
            'success': True,
            'data': data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in predictive analytics endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/analytics/dashboard')
def get_dashboard_summary():
    """
    Get summary analytics for dashboard display.
    
    Returns:
        JSON response with dashboard summary data
    """
    try:
        # Get current date range (last 30 days)
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        # Gather summary data from different analytics
        occupancy_data = analytics_engine.get_occupancy_analytics(start_date, end_date)
        revenue_data = analytics_engine.get_revenue_analytics(start_date, end_date)
        customer_data = analytics_engine.get_customer_analytics()
        room_data = analytics_engine.get_room_performance_analytics()
        
        # Create dashboard summary
        dashboard_data = {
            'summary': {
                'current_occupancy': occupancy_data['metrics']['average_occupancy'],
                'total_revenue': revenue_data['metrics']['total_revenue'],
                'active_customers': customer_data['metrics']['active_customers'],
                'avg_daily_revenue': revenue_data['metrics']['average_daily_revenue']
            },
            'trends': {
                'occupancy_trend': occupancy_data['metrics']['trend'],
                'revenue_growth': revenue_data['metrics']['growth_rate'],
                'customer_retention': customer_data['metrics']['retention_rate']
            },
            'quick_insights': [
                f"Current average occupancy: {occupancy_data['metrics']['average_occupancy']}%",
                f"Revenue growth: {revenue_data['metrics']['growth_rate']}%",
                f"Customer retention: {customer_data['metrics']['retention_rate']}%"
            ]
        }
        
        return jsonify({
            'success': True,
            'data': dashboard_data,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in dashboard summary endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/analytics/export', methods=['POST'])
def export_analytics_report():
    """
    Export analytics report to file.
    
    Request Body:
        report_type (str): Type of report ('occupancy', 'revenue', 'customer', 'comprehensive')
        start_date (str): Start date in YYYY-MM-DD format
        end_date (str): End date in YYYY-MM-DD format
    
    Returns:
        JSON response with export status and file path
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body required',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        report_type = data.get('report_type', 'comprehensive')
        start_date = data.get('start_date', (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
        end_date = data.get('end_date', datetime.now().strftime('%Y-%m-%d'))
        
        # Validate inputs
        valid_report_types = ['occupancy', 'revenue', 'customer', 'comprehensive']
        if report_type not in valid_report_types:
            return jsonify({
                'success': False,
                'error': f'Invalid report type. Must be one of: {valid_report_types}',
                'timestamp': datetime.now().isoformat()
            }), 400
        
        # Validate date format
        datetime.strptime(start_date, '%Y-%m-%d')
        datetime.strptime(end_date, '%Y-%m-%d')
        
        # Export report
        file_path = analytics_engine.export_analytics_report(report_type, start_date, end_date)
        
        if file_path:
            return jsonify({
                'success': True,
                'data': {
                    'file_path': file_path,
                    'report_type': report_type,
                    'date_range': {'start': start_date, 'end': end_date}
                },
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to generate report',
                'timestamp': datetime.now().isoformat()
            }), 500
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid date format. Use YYYY-MM-DD: {str(e)}',
            'timestamp': datetime.now().isoformat()
        }), 400
        
    except Exception as e:
        logger.error(f"Error in export analytics endpoint: {e}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'timestamp': datetime.now().isoformat()
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'timestamp': datetime.now().isoformat()
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }), 500

# API Documentation endpoint
@app.route('/api/docs')
def api_documentation():
    """
    API documentation endpoint.
    
    Returns:
        JSON response with API documentation
    """
    docs = {
        'title': 'Pacific Reef Hotel Analytics API',
        'version': '1.0.0',
        'description': 'REST API for hotel analytics and business intelligence',
        'endpoints': {
            'GET /': 'Health check',
            'GET /api/analytics/occupancy': 'Get occupancy analytics',
            'GET /api/analytics/revenue': 'Get revenue analytics',
            'GET /api/analytics/customers': 'Get customer analytics',
            'GET /api/analytics/rooms': 'Get room performance analytics',
            'GET /api/analytics/predictions': 'Get predictive analytics',
            'GET /api/analytics/dashboard': 'Get dashboard summary',
            'POST /api/analytics/export': 'Export analytics report',
            'GET /api/docs': 'API documentation'
        },
        'parameters': {
            'start_date': 'Start date in YYYY-MM-DD format (optional)',
            'end_date': 'End date in YYYY-MM-DD format (optional)',
            'report_type': 'Report type: occupancy, revenue, customer, comprehensive'
        },
        'response_format': {
            'success': 'Boolean indicating success',
            'data': 'Response data object',
            'timestamp': 'ISO timestamp of response',
            'error': 'Error message (if success is false)'
        }
    }
    
    return jsonify(docs)

if __name__ == '__main__':
    print("Starting Pacific Reef Hotel Analytics API Server...")
    print(f"Server running on port {app.config['PORT']}")
    print("API Documentation available at: /api/docs")
    
    # Run the Flask development server
    app.run(
        host='0.0.0.0',
        port=app.config['PORT'],
        debug=app.config['DEBUG']
    )