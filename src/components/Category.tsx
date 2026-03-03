import styled from "styled-components";
import CharButton from "./CharButton";
import { translateCategoryName } from "../i18n";
import type { Category as CategoryType } from "../types";

const Wrapper = styled.div`
  margin-bottom: 8px;
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 4px 4px 4px;
  display: block;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 38px);
  gap: 4px;
`;

interface CategoryProps {
  category: CategoryType;
  onCopy: (message: string) => void;
}

export default function Category({ category, onCopy }: CategoryProps) {
  return (
    <Wrapper>
      <Label>{translateCategoryName(category.name)}</Label>
      <Grid>
        {category.chars.map(([char, name]) => (
          <CharButton key={char} char={char} name={name} onCopy={onCopy} />
        ))}
      </Grid>
    </Wrapper>
  );
}
