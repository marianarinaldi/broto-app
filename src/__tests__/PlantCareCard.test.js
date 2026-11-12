import { render } from '@testing-library/react-native';
import { describe, expect, it, jest } from '@jest/globals';

import PlantCareCard from '../components/PlantCareCard';

jest.mock('@expo/vector-icons', () => ({
  Feather: ({ name, testID }) => {
    const { Text } = require('react-native');
    return <Text testID={testID}>{name}</Text>;
  },
  Ionicons: ({ name, testID }) => {
    const { Text } = require('react-native');
    return <Text testID={testID}>{name}</Text>;
  },
  MaterialCommunityIcons: ({ name, testID }) => {
    const { Text } = require('react-native');
    return <Text testID={testID}>{name}</Text>;
  },
}));

describe('PlantCareCard', () => {
  it('renders the light, watering, environment and fertilization recommendations', () => {
    const { getByText, getByTestId } = render(
      <PlantCareCard
        environment="interno"
        fertilizationTips="Adube a cada 30 dias."
        lightType="luz difusa"
        wateringIntervalDays={7}
      />,
    );

    expect(getByText('luz difusa')).toBeTruthy();
    expect(getByText('A cada 7 dias')).toBeTruthy();
    expect(getByText('Ambiente interno')).toBeTruthy();
    expect(getByText('Adube a cada 30 dias.')).toBeTruthy();
    expect(getByTestId('plant-care-light-icon')).toBeTruthy();
    expect(getByTestId('plant-care-water-icon')).toBeTruthy();
    expect(getByTestId('plant-care-environment-icon')).toBeTruthy();
  });
});
