import { Heading, Tag, TagList } from "@/components/ui";
import type { SkillGroup } from "@/lib/content";

/** Each skill group's name and its skills as tags (spec 0006, AC-4). */
export function SkillGroups({ groups }: { readonly groups: readonly SkillGroup[] }) {
  return (
    <div className="grid gap-10 md:grid-cols-3">
      {groups.map((group) => (
        <div key={group.name} className="flex flex-col gap-4">
          <Heading level={3}>{group.name}</Heading>
          <TagList label={group.name}>
            {group.skills.map((skill) => (
              <Tag key={skill}>{skill}</Tag>
            ))}
          </TagList>
        </div>
      ))}
    </div>
  );
}
