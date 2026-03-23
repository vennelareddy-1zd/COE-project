import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  Container, TextField, Button, Typography,
  Card, CardContent, AppBar, Toolbar,
  Grid, Select, MenuItem,
  LinearProgress, Table, TableBody,
  TableCell, TableHead, TableRow, Box,
  Chip, IconButton, Tooltip as MuiTooltip,
  Fade, Zoom, Divider, Alert, Snackbar,
  Tabs, Tab, Paper, Avatar, Badge
} from "@mui/material";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

import {
  Psychology, History, Analytics, TrendingUp,
  ContentCopy, CheckCircle,
  Info, Speed, Category, Assessment,
  Lightbulb, ClearAll
} from "@mui/icons-material";

// API base URL - uses relative path in production, localhost in development
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://your-app.onrender.com/predict";

function App() {
  const [complaint, setComplaint] = useState("");
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [example, setExample] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });
  const [selectedTab, setSelectedTab] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const examples = [
    { text: "I was charged twice for a credit card transaction", category: "Credit card" },
    { text: "My bank account was closed without notice", category: "Bank account" },
    { text: "I am receiving repeated debt collection calls even after paying", category: "Debt collection" },
    { text: "My loan payment is not reflected in my account", category: "Consumer Loan" },
    { text: "My mortgage interest increased unexpectedly this month", category: "Mortgage" },
    { text: "Fraudulent charges appeared on my credit report", category: "Credit reporting" },
    { text: "Money transfer failed but amount was deducted", category: "Money transfers" },
    { text: "Payday loan fees are excessive and unclear", category: "Payday loan" },
    { text: "Prepaid card balance disappeared", category: "Prepaid card" },
    { text: "Unauthorized withdrawal from my checking account", category: "Checking account" }
  ];

  const categoryColors = {
    "Credit card": "#4f46e5",
    "Bank account": "#22c55e",
    "Debt collection": "#f97316",
    "Consumer Loan": "#06b6d4",
    "Mortgage": "#ec4899",
    "Credit reporting": "#8b5cf6",
    "Money transfers": "#14b8a6",
    "Payday loan": "#f59e0b",
    "Prepaid card": "#6366f1",
    "Checking account": "#10b981",
    "Student loan": "#3b82f6",
    "Other": "#6b7280"
  };

  const categoryIcons = {
    "Credit card": "💳",
    "Bank account": "🏦",
    "Debt collection": "📞",
    "Consumer Loan": "💰",
    "Mortgage": "🏠",
    "Credit reporting": "📊",
    "Money transfers": "💸",
    "Payday loan": "📅",
    "Prepaid card": "💳",
    "Checking account": "📋",
    "Student loan": "🎓",
    "Other": "📁"
  };

  useEffect(() => {
    fetchMetrics();
    const savedHistory = localStorage.getItem("complaintHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("complaintHistory", JSON.stringify(history));
  }, [history]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/metrics`);
      const data = await res.json();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  };

  const predict = async () => {
    if (!complaint.trim()) {
      setError("Please enter a complaint to classify");
      return;
    }
    if (complaint.trim().length < 10) {
      setError("Complaint is too short. Please provide more details.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/predict`,
        { complaint }
      );

      const result = {
        text: complaint,
        category: res.data.category,
        confidence: res.data.confidence,
        timestamp: new Date().toLocaleString(),
        id: Date.now()
      };

      setPrediction(res.data.category);
      setConfidence(res.data.confidence);
      setHistory(prev => [result, ...prev].slice(0, 50));
      setSnackbar({ open: true, message: "Classification successful!" });
    } catch (err) {
      setError("Failed to classify complaint. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setSnackbar({ open: true, message: "History cleared!" });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: "Copied to clipboard!" });
  };

  const handleExampleSelect = (e) => {
    const selected = e.target.value;
    setExample(selected);
    setComplaint(selected);
    setCharCount(selected.length);
  };

  const handleComplaintChange = (e) => {
    const text = e.target.value;
    setComplaint(text);
    setCharCount(text.length);
    if (text === "") setExample("");
  };

  const getConfidenceLevel = (conf) => {
    if (conf >= 0.8) return { label: "High", color: "success" };
    if (conf >= 0.6) return { label: "Medium", color: "warning" };
    return { label: "Low", color: "error" };
  };

  const stats = {};
  history.forEach(h => {
    stats[h.category] = (stats[h.category] || 0) + 1;
  });

  const chartData = Object.keys(stats).map(k => ({
    name: k,
    value: stats[k],
    color: categoryColors[k] || "#6b7280"
  }));

  const barChartData = chartData.sort((a, b) => b.value - a.value).slice(0, 8);

  const total = history.length;
  const topCategory = chartData.length
    ? chartData.reduce((a, b) => a.value > b.value ? a : b).name
    : "N/A";

  const avgConfidence = history.length
    ? (history.reduce((sum, h) => sum + h.confidence, 0) / history.length * 100).toFixed(1)
    : 0;

  const recentClassifications = history.slice(0, 5);

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      pb: 4
    }}>
      {/* NAVBAR */}
      <AppBar elevation={0} sx={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
        <Toolbar>
          <Psychology sx={{ color: "white", mr: 1, fontSize: 32 }} />
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700, color: "white" }}>
            Financial AI Classifier
          </Typography>
          <Chip 
            icon={<Speed />} 
            label="v2.0" 
            size="small" 
            sx={{ color: "white", borderColor: "white", bgcolor: "rgba(255,255,255,0.2)" }} 
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      {/* HERO */}
      <Box sx={{ textAlign: "center", pt: 12, pb: 4, px: 2 }}>
        <Fade in timeout={1000}>
          <Box>
            <Typography variant="h2" sx={{ fontWeight: 800, color: "white", mb: 2 }}>
              AI Financial Complaint Classifier
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.8)", maxWidth: 600, mx: "auto" }}>
              Instantly analyze and categorize financial complaints using advanced machine learning
            </Typography>
          </Box>
        </Fade>
      </Box>

      <Container maxWidth="xl">
        {/* STATS CARDS */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { icon: <Assessment />, label: "Total Classified", value: total, color: "#4f46e5" },
            { icon: <Category />, label: "Top Category", value: topCategory, color: "#22c55e" },
            { icon: <TrendingUp />, label: "Avg Confidence", value: `${avgConfidence}%`, color: "#f97316" },
            { icon: <Analytics />, label: "Categories", value: chartData.length, color: "#06b6d4" }
          ].map((stat, idx) => (
            <Grid item xs={6} md={3} key={idx}>
              <Zoom in timeout={500 + idx * 100}>
                <Card sx={{ 
                  borderRadius: 3, 
                  bgcolor: "rgba(255,255,255,0.95)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  transition: "transform 0.3s",
                  "&:hover": { transform: "translateY(-4px)" }
                }}>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Avatar sx={{ bgcolor: stat.color, mx: "auto", mb: 1 }}>
                      {stat.icon}
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b" }}>
                      {stat.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* LEFT COLUMN - CLASSIFIER */}
          <Grid item xs={12} lg={7}>
            <Card sx={{
              borderRadius: 4,
              bgcolor: "rgba(255,255,255,0.95)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              overflow: "visible"
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Psychology sx={{ fontSize: 32, color: "#4f46e5", mr: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    Complaint Classifier
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                <TextField
                  placeholder="Describe your financial complaint in detail..."
                  multiline
                  rows={6}
                  fullWidth
                  value={complaint}
                  onChange={handleComplaintChange}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: "#f8fafc",
                      fontSize: "1.1rem",
                      lineHeight: 1.6
                    }
                  }}
                />
                
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, mb: 2 }}>
                  <Typography variant="caption" sx={{ color: charCount < 10 ? "#ef4444" : "#64748b" }}>
                    {charCount} characters {charCount < 10 && "(minimum 10 required)"}
                  </Typography>
                  {complaint && (
                    <Button size="small" onClick={() => { setComplaint(""); setExample(""); setCharCount(0); }}>
                      Clear
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Select
                      fullWidth
                      value={example}
                      displayEmpty
                      onChange={handleExampleSelect}
                      sx={{ borderRadius: 3, bgcolor: "#f8fafc" }}
                    >
                      <MenuItem value="">
                        <em>Try an example complaint...</em>
                      </MenuItem>
                      {examples.map((e, i) => (
                        <MenuItem key={i} value={e.text}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <span style={{ marginRight: 8 }}>{categoryIcons[e.category]}</span>
                            {e.text.substring(0, 40)}...
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={predict}
                      disabled={loading}
                      sx={{
                        height: "56px",
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        textTransform: "none",
                        boxShadow: "0 4px 20px rgba(79, 70, 229, 0.4)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #4338ca, #6d28d9)",
                          boxShadow: "0 6px 24px rgba(79, 70, 229, 0.5)"
                        }
                      }}
                    >
                      {loading ? "Analyzing..." : "Classify Complaint"}
                    </Button>
                  </Grid>
                </Grid>

                {prediction && (
                  <Fade in>
                    <Box sx={{ mt: 4 }}>
                      <Divider sx={{ mb: 3 }} />
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Classification Result
                      </Typography>
                      
                      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "#f0fdf4", border: "2px solid #86efac" }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Avatar sx={{ bgcolor: categoryColors[prediction] || "#4f46e5", mr: 2, fontSize: "1.5rem" }}>
                            {categoryIcons[prediction] || "📝"}
                          </Avatar>
                          <Box>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1e293b" }}>
                              {prediction}
                            </Typography>
                            <Chip 
                              size="small" 
                              label={getConfidenceLevel(confidence).label + " Confidence"}
                              color={getConfidenceLevel(confidence).color}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="body2" sx={{ color: "#64748b" }}>
                              Confidence Score
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {(confidence * 100).toFixed(2)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={confidence * 100}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              bgcolor: "#e2e8f0",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 5,
                                background: `linear-gradient(90deg, ${categoryColors[prediction] || "#4f46e5"}, #7c3aed)`
                              }
                            }}
                          />
                        </Box>
                      </Paper>
                    </Box>
                  </Fade>
                )}
              </CardContent>
            </Card>

            {/* HISTORY TABLE */}
            <Card sx={{ mt: 3, borderRadius: 4, bgcolor: "rgba(255,255,255,0.95)" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <History sx={{ color: "#4f46e5", mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Recent Classifications
                    </Typography>
                    <Badge badgeContent={history.length} color="primary" sx={{ ml: 1 }} />
                  </Box>
                  {history.length > 0 && (
                    <Button 
                      startIcon={<ClearAll />} 
                      size="small" 
                      color="error"
                      onClick={clearHistory}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>

                {history.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4, color: "#64748b" }}>
                    <Info sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                    <Typography>No classifications yet. Try the examples above!</Typography>
                  </Box>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Complaint Preview</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Confidence</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentClassifications.map((h) => (
                        <TableRow key={h.id} hover>
                          <TableCell>
                            <MuiTooltip title={h.text}>
                              <Typography sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {h.text.substring(0, 50)}...
                              </Typography>
                            </MuiTooltip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              avatar={<Avatar sx={{ bgcolor: "transparent", fontSize: "1rem" }}>{categoryIcons[h.category] || "📝"}</Avatar>}
                              label={h.category}
                              sx={{ 
                                bgcolor: `${categoryColors[h.category] || "#6b7280"}20`,
                                color: categoryColors[h.category] || "#6b7280",
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {(h.confidence * 100).toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={() => copyToClipboard(h.text)}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT COLUMN - ANALYTICS */}
          <Grid item xs={12} lg={5}>
            <Paper sx={{ borderRadius: 4, overflow: "hidden", bgcolor: "rgba(255,255,255,0.95)" }}>
              <Tabs 
                value={selectedTab} 
                onChange={(e, v) => setSelectedTab(v)}
                sx={{ borderBottom: 1, borderColor: "divider" }}
              >
                <Tab icon={<PieChart />} label="Distribution" />
                <Tab icon={<BarChart />} label="Trends" />
                <Tab icon={<Assessment />} label="Metrics" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {selectedTab === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Category Distribution
                    </Typography>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie 
                            data={chartData} 
                            dataKey="value" 
                            nameKey="name"
                            outerRadius={100}
                            innerRadius={60}
                            paddingAngle={2}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: "center", py: 8, color: "#64748b" }}>
                        <PieChart sx={{ fontSize: 48, opacity: 0.5 }} />
                        <Typography>No data to display</Typography>
                      </Box>
                    )}

                    {/* Category Legend */}
                    <Box sx={{ mt: 2 }}>
                      {chartData.map((cat, idx) => (
                        <Chip
                          key={idx}
                          size="small"
                          avatar={<Avatar sx={{ bgcolor: cat.color, width: 16, height: 16 }}> </Avatar>}
                          label={`${cat.name} (${cat.value})`}
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {selectedTab === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Top Categories
                    </Typography>
                    {barChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={120} style={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box sx={{ textAlign: "center", py: 8, color: "#64748b" }}>
                        <BarChart sx={{ fontSize: 48, opacity: 0.5 }} />
                        <Typography>No data to display</Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {selectedTab === 2 && metrics && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Model Performance
                    </Typography>
                    
                    {[
                      { label: "Accuracy", value: metrics.accuracy, icon: <CheckCircle /> },
                      { label: "Precision", value: metrics.precision, icon: <Assessment /> },
                      { label: "Recall", value: metrics.recall, icon: <TrendingUp /> }
                    ].map((metric, idx) => (
                      <Box key={idx} sx={{ mb: 3 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ bgcolor: "#4f46e5", width: 32, height: 32, mr: 1 }}>
                              {metric.icon}
                            </Avatar>
                            <Typography sx={{ fontWeight: 500 }}>{metric.label}</Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 700, color: "#4f46e5" }}>
                            {(metric.value * 100).toFixed(2)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={metric.value * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: "#e2e8f0",
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 4,
                              background: "linear-gradient(90deg, #4f46e5, #7c3aed)"
                            }
                          }}
                        />
                      </Box>
                    ))}

                    <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                      <Typography variant="body2">
                        Model trained on 50,000 CFPB complaint records using Logistic Regression with TF-IDF vectorization.
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </Box>
            </Paper>

            {/* TIPS CARD */}
            <Card sx={{ mt: 3, borderRadius: 4, bgcolor: "rgba(255,255,255,0.95)" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Lightbulb sx={{ color: "#f59e0b", mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Tips for Better Results
                  </Typography>
                </Box>
                <ul style={{ margin: 0, paddingLeft: 20, color: "#64748b" }}>
                  <li>Provide specific details about the issue</li>
                  <li>Mention dates, amounts, and account numbers</li>
                  <li>Describe any previous attempts to resolve</li>
                  <li>Include the financial product/service name</li>
                  <li>Avoid using abbreviations or slang</li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App;
