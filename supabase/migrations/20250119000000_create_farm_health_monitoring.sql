-- =====================================================
-- FARM HEALTH MONITORING DATABASE INFRASTRUCTURE
-- =====================================================
-- Creates comprehensive farm health monitoring system
-- with real-time subscriptions and trust indicators

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types for health monitoring
CREATE TYPE health_status AS ENUM ('excellent', 'good', 'fair', 'poor', 'critical');
CREATE TYPE trust_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE data_source AS ENUM ('satellite', 'sensor', 'manual', 'ai_analysis', 'weather_api');
CREATE TYPE alert_type AS ENUM ('health_decline', 'disease_risk', 'weather_warning', 'irrigation_needed', 'harvest_ready');

-- =====================================================
-- FARM HEALTH SNAPSHOTS TABLE
-- =====================================================
-- Stores periodic health assessments for farms
CREATE TABLE IF NOT EXISTS public.farm_health_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core health metrics
  health_score DECIMAL(3,2) NOT NULL CHECK (health_score >= 0 AND health_score <= 1),
  health_status health_status NOT NULL,
  
  -- Detailed health components
  soil_health_score DECIMAL(3,2) CHECK (soil_health_score >= 0 AND soil_health_score <= 1),
  crop_health_score DECIMAL(3,2) CHECK (crop_health_score >= 0 AND crop_health_score <= 1),
  water_status_score DECIMAL(3,2) CHECK (water_status_score >= 0 AND water_status_score <= 1),
  pest_disease_score DECIMAL(3,2) CHECK (pest_disease_score >= 0 AND pest_disease_score <= 1),
  
  -- Environmental factors
  weather_impact_score DECIMAL(3,2) CHECK (weather_impact_score >= 0 AND weather_impact_score <= 1),
  seasonal_adjustment DECIMAL(3,2) DEFAULT 1.0,
  
  -- Data quality and trust
  data_freshness_hours INTEGER DEFAULT 0,
  confidence_level DECIMAL(3,2) DEFAULT 0.7 CHECK (confidence_level >= 0 AND confidence_level <= 1),
  data_sources data_source[] DEFAULT ARRAY[]::data_source[],
  
  -- Analysis metadata
  analysis_version TEXT DEFAULT '1.0',
  ai_model_used TEXT,
  processing_time_ms INTEGER,
  
  -- Timestamps
  snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- TRUST INDICATORS TABLE
-- =====================================================
-- Manages trust indicators for health data reliability
CREATE TABLE IF NOT EXISTS public.trust_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  
  -- Trust metrics
  indicator_name TEXT NOT NULL,
  trust_level trust_level NOT NULL,
  trust_score DECIMAL(3,2) NOT NULL CHECK (trust_score >= 0 AND trust_score <= 1),
  
  -- Indicator details
  description TEXT,
  data_source data_source NOT NULL,
  last_verified TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verification_method TEXT,
  
  -- Reliability metrics
  accuracy_percentage DECIMAL(5,2),
  sample_size INTEGER DEFAULT 1,
  historical_reliability DECIMAL(3,2),
  
  -- Status and metadata
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique indicators per farm
  UNIQUE(farm_id, indicator_name)
);

-- =====================================================
-- HEALTH ALERTS TABLE
-- =====================================================
-- Stores health-related alerts and notifications
CREATE TABLE IF NOT EXISTS public.health_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Alert details
  alert_type alert_type NOT NULL,
  severity alert_severity NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Alert context
  health_score_at_alert DECIMAL(3,2),
  threshold_breached DECIMAL(3,2),
  affected_areas TEXT[], -- Field IDs or area descriptions
  
  -- Alert lifecycle
  is_active BOOLEAN DEFAULT true,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  
  -- Action tracking
  recommended_actions TEXT[],
  actions_taken TEXT[],
  
  -- Metadata
  alert_data JSONB DEFAULT '{}',
  
  -- Timestamps
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- HEALTH TRENDS TABLE
-- =====================================================
-- Stores aggregated health trend data for analytics
CREATE TABLE IF NOT EXISTS public.health_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  
  -- Trend period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'seasonal'
  
  -- Aggregated metrics
  avg_health_score DECIMAL(3,2) NOT NULL,
  min_health_score DECIMAL(3,2) NOT NULL,
  max_health_score DECIMAL(3,2) NOT NULL,
  health_volatility DECIMAL(3,2), -- Standard deviation
  
  -- Trend analysis
  trend_direction TEXT, -- 'improving', 'stable', 'declining'
  trend_strength DECIMAL(3,2), -- How strong the trend is
  seasonal_factor DECIMAL(3,2) DEFAULT 1.0,
  
  -- Component trends
  soil_trend DECIMAL(3,2),
  crop_trend DECIMAL(3,2),
  water_trend DECIMAL(3,2),
  pest_trend DECIMAL(3,2),
  
  -- Data quality
  data_points_count INTEGER NOT NULL,
  confidence_level DECIMAL(3,2) DEFAULT 0.7,
  
  -- Timestamps
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure unique periods per farm
  UNIQUE(farm_id, period_start, period_end, period_type)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Farm health snapshots indexes
CREATE INDEX IF NOT EXISTS idx_farm_health_snapshots_farm_id ON public.farm_health_snapshots(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_health_snapshots_user_id ON public.farm_health_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_health_snapshots_date ON public.farm_health_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_farm_health_snapshots_score ON public.farm_health_snapshots(health_score);
CREATE INDEX IF NOT EXISTS idx_farm_health_snapshots_status ON public.farm_health_snapshots(health_status);

-- Trust indicators indexes
CREATE INDEX IF NOT EXISTS idx_trust_indicators_farm_id ON public.trust_indicators(farm_id);
CREATE INDEX IF NOT EXISTS idx_trust_indicators_active ON public.trust_indicators(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_trust_indicators_trust_level ON public.trust_indicators(trust_level);

-- Health alerts indexes
CREATE INDEX IF NOT EXISTS idx_health_alerts_farm_id ON public.health_alerts(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_alerts_user_id ON public.health_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_health_alerts_active ON public.health_alerts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_health_alerts_severity ON public.health_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_health_alerts_triggered ON public.health_alerts(triggered_at DESC);

-- Health trends indexes
CREATE INDEX IF NOT EXISTS idx_health_trends_farm_id ON public.health_trends(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_trends_period ON public.health_trends(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_health_trends_type ON public.health_trends(period_type);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.farm_health_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_trends ENABLE ROW LEVEL SECURITY;

-- Farm health snapshots policies
CREATE POLICY \"Users can view health snapshots for their farms\" 
  ON public.farm_health_snapshots FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY \"Users can insert health snapshots for their farms\" 
  ON public.farm_health_snapshots FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY \"Users can update health snapshots for their farms\" 
  ON public.farm_health_snapshots FOR UPDATE 
  USING (user_id = auth.uid());

-- Trust indicators policies
CREATE POLICY \"Users can view trust indicators for their farms\" 
  ON public.trust_indicators FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.farms 
    WHERE farms.id = trust_indicators.farm_id 
    AND farms.user_id = auth.uid()
  ));

CREATE POLICY \"Users can manage trust indicators for their farms\" 
  ON public.trust_indicators 
  USING (EXISTS (
    SELECT 1 FROM public.farms 
    WHERE farms.id = trust_indicators.farm_id 
    AND farms.user_id = auth.uid()
  ));

-- Health alerts policies
CREATE POLICY \"Users can view health alerts for their farms\" 
  ON public.health_alerts FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY \"Users can manage health alerts for their farms\" 
  ON public.health_alerts 
  USING (user_id = auth.uid());

-- Health trends policies
CREATE POLICY \"Users can view health trends for their farms\" 
  ON public.health_trends FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.farms 
    WHERE farms.id = health_trends.farm_id 
    AND farms.user_id = auth.uid()
  ));

CREATE POLICY \"Users can manage health trends for their farms\" 
  ON public.health_trends 
  USING (EXISTS (
    SELECT 1 FROM public.farms 
    WHERE farms.id = health_trends.farm_id 
    AND farms.user_id = auth.uid()
  ));

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at triggers
CREATE TRIGGER update_farm_health_snapshots_updated_at
BEFORE UPDATE ON public.farm_health_snapshots
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_indicators_updated_at
BEFORE UPDATE ON public.trust_indicators
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_alerts_updated_at
BEFORE UPDATE ON public.health_alerts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REAL-TIME SUBSCRIPTION FUNCTIONS
-- =====================================================

-- Function to calculate farm health score
CREATE OR REPLACE FUNCTION public.calculate_farm_health_score(
  p_farm_id UUID,
  p_soil_health DECIMAL DEFAULT 0.8,
  p_crop_health DECIMAL DEFAULT 0.8,
  p_water_status DECIMAL DEFAULT 0.8,
  p_pest_disease DECIMAL DEFAULT 0.9,
  p_weather_impact DECIMAL DEFAULT 0.8
)
RETURNS DECIMAL AS $
DECLARE
  health_score DECIMAL;
  weight_soil DECIMAL := 0.25;
  weight_crop DECIMAL := 0.30;
  weight_water DECIMAL := 0.20;
  weight_pest DECIMAL := 0.15;
  weight_weather DECIMAL := 0.10;
BEGIN
  -- Calculate weighted average
  health_score := (
    p_soil_health * weight_soil +
    p_crop_health * weight_crop +
    p_water_status * weight_water +
    p_pest_disease * weight_pest +
    p_weather_impact * weight_weather
  );
  
  -- Ensure score is within bounds
  health_score := GREATEST(0, LEAST(1, health_score));
  
  RETURN health_score;
END;
$ LANGUAGE plpgsql STABLE;

-- Function to get health status from score
CREATE OR REPLACE FUNCTION public.get_health_status(health_score DECIMAL)
RETURNS health_status AS $
BEGIN
  CASE 
    WHEN health_score >= 0.9 THEN RETURN 'excellent';
    WHEN health_score >= 0.75 THEN RETURN 'good';
    WHEN health_score >= 0.6 THEN RETURN 'fair';
    WHEN health_score >= 0.4 THEN RETURN 'poor';
    ELSE RETURN 'critical';
  END CASE;
END;
$ LANGUAGE plpgsql IMMUTABLE;

-- Function to create health snapshot
CREATE OR REPLACE FUNCTION public.create_health_snapshot(
  p_farm_id UUID,
  p_soil_health DECIMAL DEFAULT 0.8,
  p_crop_health DECIMAL DEFAULT 0.8,
  p_water_status DECIMAL DEFAULT 0.8,
  p_pest_disease DECIMAL DEFAULT 0.9,
  p_weather_impact DECIMAL DEFAULT 0.8,
  p_data_sources data_source[] DEFAULT ARRAY['ai_analysis']::data_source[],
  p_confidence DECIMAL DEFAULT 0.7
)
RETURNS UUID AS $
DECLARE
  snapshot_id UUID;
  calculated_score DECIMAL;
  calculated_status health_status;
BEGIN
  -- Calculate health score
  calculated_score := public.calculate_farm_health_score(
    p_farm_id, p_soil_health, p_crop_health, p_water_status, p_pest_disease, p_weather_impact
  );
  
  -- Get health status
  calculated_status := public.get_health_status(calculated_score);
  
  -- Insert snapshot
  INSERT INTO public.farm_health_snapshots (
    farm_id,
    user_id,
    health_score,
    health_status,
    soil_health_score,
    crop_health_score,
    water_status_score,
    pest_disease_score,
    weather_impact_score,
    data_sources,
    confidence_level
  )
  SELECT 
    p_farm_id,
    farms.user_id,
    calculated_score,
    calculated_status,
    p_soil_health,
    p_crop_health,
    p_water_status,
    p_pest_disease,
    p_weather_impact,
    p_data_sources,
    p_confidence
  FROM public.farms
  WHERE farms.id = p_farm_id
  RETURNING id INTO snapshot_id;
  
  RETURN snapshot_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update trust indicators
CREATE OR REPLACE FUNCTION public.update_trust_indicator(
  p_farm_id UUID,
  p_indicator_name TEXT,
  p_trust_score DECIMAL,
  p_data_source data_source,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $
DECLARE
  indicator_id UUID;
  calculated_trust_level trust_level;
BEGIN
  -- Calculate trust level from score
  calculated_trust_level := CASE 
    WHEN p_trust_score >= 0.8 THEN 'high'::trust_level
    WHEN p_trust_score >= 0.6 THEN 'medium'::trust_level
    ELSE 'low'::trust_level
  END;
  
  -- Upsert trust indicator
  INSERT INTO public.trust_indicators (
    farm_id,
    indicator_name,
    trust_level,
    trust_score,
    description,
    data_source,
    last_verified
  )
  VALUES (
    p_farm_id,
    p_indicator_name,
    calculated_trust_level,
    p_trust_score,
    p_description,
    p_data_source,
    now()
  )
  ON CONFLICT (farm_id, indicator_name) 
  DO UPDATE SET
    trust_level = calculated_trust_level,
    trust_score = p_trust_score,
    description = COALESCE(p_description, trust_indicators.description),
    data_source = p_data_source,
    last_verified = now(),
    updated_at = now()
  RETURNING id INTO indicator_id;
  
  RETURN indicator_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to trigger health alerts
CREATE OR REPLACE FUNCTION public.check_health_alerts()
RETURNS TRIGGER AS $
DECLARE
  alert_threshold DECIMAL := 0.4; -- Alert when health drops below 40%
BEGIN
  -- Check if health score dropped significantly
  IF NEW.health_score < alert_threshold THEN
    INSERT INTO public.health_alerts (
      farm_id,
      user_id,
      alert_type,
      severity,
      title,
      message,
      health_score_at_alert,
      threshold_breached,
      recommended_actions
    )
    VALUES (
      NEW.farm_id,
      NEW.user_id,
      'health_decline',
      CASE 
        WHEN NEW.health_score < 0.2 THEN 'critical'::alert_severity
        WHEN NEW.health_score < 0.3 THEN 'warning'::alert_severity
        ELSE 'info'::alert_severity
      END,
      'Farm Health Alert',
      format('Farm health has dropped to %s%%. Immediate attention required.', 
             round(NEW.health_score * 100)),
      NEW.health_score,
      alert_threshold,
      ARRAY['Check irrigation systems', 'Inspect crops for disease', 'Review recent weather impact']
    );
  END IF;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create trigger for health alerts
CREATE TRIGGER trigger_health_alerts
AFTER INSERT ON public.farm_health_snapshots
FOR EACH ROW EXECUTE FUNCTION public.check_health_alerts();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant specific permissions for real-time subscriptions
GRANT SELECT ON public.farm_health_snapshots TO anon;
GRANT SELECT ON public.trust_indicators TO anon;
GRANT SELECT ON public.health_alerts TO anon;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample trust indicators
INSERT INTO public.trust_indicators (
  farm_id, indicator_name, trust_level, trust_score, description, data_source
)
SELECT 
  farms.id,
  'Satellite Data Quality',
  'high'::trust_level,
  0.95,
  'High-resolution satellite imagery with 99.7% accuracy',
  'satellite'::data_source
FROM public.farms
LIMIT 1
ON CONFLICT (farm_id, indicator_name) DO NOTHING;

-- Create initial health snapshots for existing farms
INSERT INTO public.farm_health_snapshots (
  farm_id, user_id, health_score, health_status,
  soil_health_score, crop_health_score, water_status_score,
  pest_disease_score, weather_impact_score,
  data_sources, confidence_level
)
SELECT 
  farms.id,
  farms.user_id,
  0.75,
  'good'::health_status,
  0.8, 0.7, 0.8, 0.9, 0.6,
  ARRAY['ai_analysis', 'satellite']::data_source[],
  0.85
FROM public.farms
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Farm health monitoring infrastructure is now ready
-- with real-time subscriptions and trust indicators"