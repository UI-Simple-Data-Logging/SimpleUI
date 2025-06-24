import React, { useState } from 'react';

const PROCESS_STATION_OPTIONS = ['Silvering', 'Streeting', 'Final Product check'];

const CAUSE_OF_FAILURE_OPTIONS = [
  'Voids',
  'Insufficient Filling',
  'Contamination',
  'Cracks or Scratches',
  'Operator Error',
  'Flexible Substrate defect',
  'Other'
];

const AFFECTED_OUTPUT_OPTIONS = [
  'No Conductivity and circuitry',
  'Reliability',
  'Out of specs',
  'Other'
];

// Mapping for auto-selection of affected output based on cause of failure
// Format: { cause: ['affectedOutput1', 'affectedOutput2', ...] }
const CAUSE_TO_OUTPUT_MAPPING = {
  'Voids': ['No Conductivity and circuitry', 'Reliability']
};

function QualityControlForm({ onSubmit, loading, existingItems }) {  const [formData, setFormData] = useState({
    processStation: 'Silvering',
    productId: '',
    decision: 'Yes',
    reworkability: 'No',
    reworked: 'No',
    causeOfFailure: [],
    affectedOutput: [],
    comments: '',
    customCauseOfFailure: '',
    customAffectedOutput: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [existingRecord, setExistingRecord] = useState(null);
  const [showAllFields, setShowAllFields] = useState(false);

  // Check for existing product ID
  const checkExistingProduct = (productId) => {
    if (!productId.trim()) {
      setExistingRecord(null);
      setShowAllFields(false);
      return;
    }
    
    // Find existing record with same product ID
    const existing = existingItems.find(item => 
      item.productId && item.productId.toLowerCase() === productId.toLowerCase()
    );

    if (existing) {
      setExistingRecord(existing);
      
      // If existing record's decision was "Goes to Rework", load the data
      if (existing.decision === 'Goes to Rework') {        setFormData(prev => ({
          ...prev,
          processStation: existing.processStation || 'Silvering',
          productId: existing.productId,
          decision: existing.decision,
          reworkability: existing.reworkability || 'No',
          reworked: existing.reworked || 'No',
          causeOfFailure: existing.causeOfFailure || [],
          affectedOutput: existing.affectedOutput || [],
          comments: existing.comments || '',
          customCauseOfFailure: '',
          customAffectedOutput: ''
        }));
        
        // If the existing record was reworked, show all fields regardless of decision
        if (existing.reworked === 'Yes') {
          setShowAllFields(true);
        }
      }
    } else {
      setExistingRecord(null);
      setShowAllFields(false);
    }
  };

  // Handle Product ID change
  const handleProductIdChange = (e) => {
    const newProductId = e.target.value;
    setFormData(prev => ({ ...prev, productId: newProductId }));
    
    // Check for existing product immediately on change
    checkExistingProduct(newProductId);
  };

  // Handle Reworked change
  const handleReworkedChange = (newReworked) => {
    setFormData(prev => ({ ...prev, reworked: newReworked }));
    
    // If reworked is set to 'Yes', show all fields regardless of decision
    if (newReworked === 'Yes') {
      setShowAllFields(true);
    } else {
      // Reset showAllFields only if it wasn't set by an existing record
      if (!existingRecord || existingRecord.reworked !== 'Yes') {
        setShowAllFields(false);
      }
    }
  };
  const toggleCauseOfFailure = (cause) => {
    const newCauses = formData.causeOfFailure.includes(cause)
      ? formData.causeOfFailure.filter(c => c !== cause)
      : [...formData.causeOfFailure, cause];

    // Auto-select affected outputs based on causes
    let autoAffectedOutputs = [];
    newCauses.forEach(cause => {
      if (CAUSE_TO_OUTPUT_MAPPING[cause]) {
        autoAffectedOutputs = [...autoAffectedOutputs, ...CAUSE_TO_OUTPUT_MAPPING[cause]];
      }
    });
    
    // Remove duplicates
    autoAffectedOutputs = [...new Set(autoAffectedOutputs)];

    setFormData(prev => ({
      ...prev,
      causeOfFailure: newCauses,
      affectedOutput: autoAffectedOutputs,
      // Clear custom cause if "Other" is deselected
      customCauseOfFailure: cause === 'Other' && !newCauses.includes('Other') ? '' : prev.customCauseOfFailure
    }));

    // Clear validation errors when user makes selection
    if (newCauses.length > 0) {
      setValidationErrors(prev => ({ ...prev, causeOfFailure: '' }));
    }
  };
  const toggleAffectedOutput = (output) => {
    const newAffectedOutput = formData.affectedOutput.includes(output)
      ? formData.affectedOutput.filter(o => o !== output)
      : [...formData.affectedOutput, output];

    setFormData(prev => ({
      ...prev,
      affectedOutput: newAffectedOutput,
      // Clear custom output if "Other" is deselected
      customAffectedOutput: output === 'Other' && !newAffectedOutput.includes('Other') ? '' : prev.customAffectedOutput
    }));

    // Clear validation errors when user makes selection
    if (newAffectedOutput.length > 0) {
      setValidationErrors(prev => ({ ...prev, affectedOutput: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};    // If decision is "No", cause of failure and affected output are required
    if (formData.decision === 'No') {
      if (formData.causeOfFailure.length === 0) {
        errors.causeOfFailure = 'At least one cause of failure must be selected when decision is No';
      } else if (formData.causeOfFailure.includes('Other') && !formData.customCauseOfFailure.trim()) {
        errors.causeOfFailure = 'Please specify the other cause of failure';
      }
      
      if (formData.affectedOutput.length === 0) {
        errors.affectedOutput = 'At least one affected output must be selected when decision is No';
      } else if (formData.affectedOutput.includes('Other') && !formData.customAffectedOutput.trim()) {
        errors.affectedOutput = 'Please specify the other affected output';
      }
    }

    // If decision is "Goes to Rework", cause of failure is required
    if (formData.decision === 'Goes to Rework') {
      if (formData.causeOfFailure.length === 0) {
        errors.causeOfFailure = 'At least one cause of failure must be selected when decision is Goes to Rework';
      } else if (formData.causeOfFailure.includes('Other') && !formData.customCauseOfFailure.trim()) {
        errors.causeOfFailure = 'Please specify the other cause of failure';
      }
    }

    // Validate custom inputs when "Other" is selected
    if (formData.causeOfFailure.includes('Other') && !formData.customCauseOfFailure.trim()) {
      errors.causeOfFailure = 'Please specify the other cause of failure';
    }
    
    if (formData.affectedOutput.includes('Other') && !formData.customAffectedOutput.trim()) {
      errors.affectedOutput = 'Please specify the other affected output';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    // Prepare submission data with custom inputs merged
    const submissionData = {
      ...formData,
      causeOfFailure: [
        ...formData.causeOfFailure.filter(cause => cause !== 'Other'),
        ...(formData.causeOfFailure.includes('Other') && formData.customCauseOfFailure.trim() 
          ? [formData.customCauseOfFailure.trim()] 
          : [])
      ],
      affectedOutput: [
        ...formData.affectedOutput.filter(output => output !== 'Other'),
        ...(formData.affectedOutput.includes('Other') && formData.customAffectedOutput.trim() 
          ? [formData.customAffectedOutput.trim()] 
          : [])
      ]
    };
    
    // Always submit all form data, regardless of conditional visibility
    onSubmit(submissionData);
      // Reset form after submission
    setFormData({
      processStation: 'Silvering',
      productId: '',
      decision: 'Yes',
      reworkability: 'No',
      reworked: 'No',
      causeOfFailure: [],
      affectedOutput: [],
      comments: '',
      customCauseOfFailure: '',
      customAffectedOutput: ''
    });
    setValidationErrors({});
    setExistingRecord(null);
    setShowAllFields(false);
  };

  const handleDecisionChange = (newDecision) => {
    setFormData(prev => ({
      ...prev,
      decision: newDecision,
      // Don't reset fields if showAllFields is true (when reworked is Yes or from existing record)
      reworkability: (!showAllFields && newDecision === 'Yes') ? 'No' : prev.reworkability,
      causeOfFailure: (!showAllFields && newDecision === 'Yes') ? [] : prev.causeOfFailure,
      affectedOutput: (!showAllFields && newDecision === 'Yes') ? [] : prev.affectedOutput
    }));
  };

  // Conditional logic for showing fields
  const showReworkability = showAllFields || formData.decision === 'Goes to Rework' || formData.decision === 'No';
  const showReworked = showAllFields || formData.decision === 'No' || formData.decision === 'Goes to Rework' || formData.reworkability === 'Yes';
  const showCauseOfFailure = showAllFields || formData.decision === 'No' || formData.decision === 'Goes to Rework';
  const showAffectedOutput = showAllFields || formData.decision === 'No' || formData.decision === 'Goes to Rework';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">🔍 Quality Control Inspection</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Process Station */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Process Station *</label>
          <select
            value={formData.processStation}
            onChange={(e) => setFormData({ ...formData, processStation: e.target.value })}
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          >
            {PROCESS_STATION_OPTIONS.map(station => (
              <option key={station} value={station}>{station}</option>
            ))}
          </select>
        </div>

        {/* Product ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product ID *</label>
          <input
            type="text"
            value={formData.productId}
            onChange={handleProductIdChange}
            placeholder="Enter product ID"
            className="w-full p-2 border rounded"
            required
            disabled={loading}
          />
          
          {/* Existing Record Info */}
          {existingRecord && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="font-medium text-yellow-800">Existing Record Found:</span>
              </div>
              <div className="mt-1 text-yellow-700">
                <div>Previous Decision: <span className="font-medium">{existingRecord.decision}</span></div>
                <div>Reworked: <span className="font-medium">{existingRecord.reworked || 'No'}</span></div>
                {existingRecord.decision === 'Goes to Rework' && (
                  <div className="text-green-600 font-medium">✓ Record data loaded for update</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Decision */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Decision *</label>
          <div className="flex gap-4">
            {['Yes', 'No', 'Goes to Rework'].map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="decision"
                  value={option}
                  checked={formData.decision === option}
                  onChange={(e) => handleDecisionChange(e.target.value)}
                  className="mr-2"
                  disabled={loading}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Show all fields indicator */}
        {showAllFields && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">ℹ️</span>
              <span className="font-medium text-blue-800">
                All fields visible {existingRecord && existingRecord.reworked === 'Yes' 
                  ? '(Product was previously reworked)' 
                  : '(Current session - Reworked is Yes)'}
              </span>
            </div>
          </div>
        )}

        {/* Reworkability - Conditional */}
        {showReworkability && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reworkability *</label>
            <div className="flex gap-4">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="reworkability"
                    value={option}
                    checked={formData.reworkability === option}
                    onChange={(e) => setFormData({ ...formData, reworkability: e.target.value })}
                    className="mr-2"
                    disabled={loading}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Reworked - Conditional */}
        {showReworked && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reworked *</label>
            <div className="flex gap-4">
              {['Yes', 'No'].map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="reworked"
                    value={option}
                    checked={formData.reworked === option}
                    onChange={(e) => handleReworkedChange(e.target.value)}
                    className="mr-2"
                    disabled={loading}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Cause of Failure - Conditional */}
        {showCauseOfFailure && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cause of Failure {(formData.decision === 'No' || formData.decision === 'Goes to Rework') && <span className="text-red-500">*</span>}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CAUSE_OF_FAILURE_OPTIONS.map(cause => (
                <button
                  key={cause}
                  type="button"
                  className={`px-3 py-2 border rounded text-sm text-left ${
                    formData.causeOfFailure.includes(cause)
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  onClick={() => toggleCauseOfFailure(cause)}
                  disabled={loading}
                >
                  {cause}
                </button>
              ))}            </div>
            {validationErrors.causeOfFailure && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.causeOfFailure}</p>
            )}
            {/* Custom Cause of Failure Input */}
            {formData.causeOfFailure.includes('Other') && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specify Other Cause of Failure
                </label>
                <input
                  type="text"
                  value={formData.customCauseOfFailure}
                  onChange={(e) => setFormData({ ...formData, customCauseOfFailure: e.target.value })}
                  placeholder="Enter specific cause of failure"
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
            )}
          </div>
        )}

        {/* Affected Output - Conditional */}
        {showAffectedOutput && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Affected Output {formData.decision === 'No' && <span className="text-red-500">*</span>}
              <span className="text-xs text-gray-500 ml-2">(Auto-selected based on cause)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {AFFECTED_OUTPUT_OPTIONS.map(output => (
                <button
                  key={output}
                  type="button"
                  className={`px-3 py-2 border rounded text-sm text-left ${
                    formData.affectedOutput.includes(output)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border-gray-300'
                  }`}
                  onClick={() => toggleAffectedOutput(output)}
                  disabled={loading}
                >
                  {output}
                </button>
              ))}            </div>
            {validationErrors.affectedOutput && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.affectedOutput}</p>
            )}
            {/* Custom Affected Output Input */}
            {formData.affectedOutput.includes('Other') && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specify Other Affected Output
                </label>
                <input
                  type="text"
                  value={formData.customAffectedOutput}
                  onChange={(e) => setFormData({ ...formData, customAffectedOutput: e.target.value })}
                  placeholder="Enter specific affected output"
                  className="w-full p-2 border rounded"
                  disabled={loading}
                />
              </div>
            )}
          </div>
        )}

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            placeholder="Enter any additional comments or observations..."
            rows={3}
            className="w-full p-2 border rounded resize-vertical"
            disabled={loading}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : (existingRecord ? 'Update QC Report' : 'Submit QC Report')}
        </button>
      </form>
    </div>
  );
}

export default QualityControlForm;